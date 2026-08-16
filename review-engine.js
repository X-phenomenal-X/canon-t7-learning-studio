(()=>{
  const clamp=(n,a=0,b=100)=>Math.max(a,Math.min(b,n));
  const avg=a=>a.length?a.reduce((s,x)=>s+x,0)/a.length:0;
  const lumAt=(arr,w,x,y)=>arr[y*w+x];

  function pixelStats(imageData,w,h){
    const d=imageData.data,n=w*h,lum=new Float32Array(n);
    let sum=0,sum2=0,dark=0,bright=0,satSum=0;
    for(let p=0,i=0;i<d.length;i+=4,p++){
      const r=d[i],g=d[i+1],b=d[i+2],l=.2126*r+.7152*g+.0722*b;
      lum[p]=l;sum+=l;sum2+=l*l;if(l<8)dark++;if(l>247)bright++;
      const mx=Math.max(r,g,b),mn=Math.min(r,g,b);satSum+=mx?((mx-mn)/mx):0;
    }
    const mean=sum/n,sd=Math.sqrt(Math.max(0,sum2/n-mean*mean));
    const cols=4,rows=3,tileEdges=Array(cols*rows).fill(0),tileCounts=Array(cols*rows).fill(0);
    let centerEdge=0,centerCount=0,smoothLap=0,smoothCount=0;
    const cx0=w*.2,cx1=w*.8,cy0=h*.18,cy1=h*.82;
    for(let y=1;y<h-1;y+=2){
      for(let x=1;x<w-1;x+=2){
        const c=lumAt(lum,w,x,y),l=lumAt(lum,w,x-1,y),r=lumAt(lum,w,x+1,y),u=lumAt(lum,w,x,y-1),dn=lumAt(lum,w,x,y+1);
        const edge=Math.abs(r-l)+Math.abs(dn-u),lap=Math.abs(4*c-l-r-u-dn);
        const tx=Math.min(cols-1,Math.floor(x/w*cols)),ty=Math.min(rows-1,Math.floor(y/h*rows)),ti=ty*cols+tx;
        tileEdges[ti]+=edge;tileCounts[ti]++;
        if(x>=cx0&&x<=cx1&&y>=cy0&&y<=cy1){centerEdge+=edge;centerCount++}
        if(edge<16){smoothLap+=lap;smoothCount++}
      }
    }
    const edges=tileEdges.map((v,i)=>v/Math.max(1,tileCounts[i])).sort((a,b)=>a-b);
    const strongest=avg(edges.slice(-3)),p75=edges[Math.max(0,Math.floor((edges.length-1)*.75))]||0,center=centerEdge/Math.max(1,centerCount),noise=smoothLap/Math.max(1,smoothCount);
    const detailSignal=Math.max(center*1.03,strongest*.92,p75);
    return{mean,sd,darkPct:dark/n*100,brightPct:bright/n*100,sat:satSum/n,detailSignal,centerDetail:center,strongestDetail:strongest,noise,width:w,height:h};
  }

  function scores(m){
    let exposure=100-Math.abs(m.mean-128)*.58;
    if(m.darkPct>7)exposure-=Math.min(28,(m.darkPct-7)*1.45);
    if(m.brightPct>4)exposure-=Math.min(32,(m.brightPct-4)*2.2);
    exposure=clamp(exposure);

    const noisePenalty=Math.max(0,m.noise-3.5)*3.5;
    const detail=clamp((m.detailSignal-9)*4.15-noisePenalty);
    let detailConfidence=94;
    if(m.mean<55||m.mean>210)detailConfidence-=24;
    else if(m.mean<75||m.mean>190)detailConfidence-=12;
    if(m.noise>8)detailConfidence-=22;else if(m.noise>5.5)detailConfidence-=10;
    if(m.darkPct+m.brightPct>20)detailConfidence-=16;
    if(Math.min(m.width,m.height)<220)detailConfidence-=12;
    detailConfidence=clamp(detailConfidence);

    let contrast;
    if(m.sd<22)contrast=clamp(m.sd/22*60);
    else if(m.sd<35)contrast=60+(m.sd-22)/13*25;
    else if(m.sd<=80)contrast=85;
    else contrast=clamp(85-(m.sd-80)*1.15,55,85);
    contrast=clamp(contrast);

    const clipping=clamp(100-m.brightPct*5.2-m.darkPct*2.25);
    const overall=Math.round(exposure*.30+detail*.25+contrast*.15+clipping*.30);
    let confidence=Math.round((detailConfidence+90)/2);
    if(m.mean<45||m.mean>220)confidence-=10;
    if(m.darkPct+m.brightPct>28)confidence-=10;
    confidence=clamp(confidence);
    return{exposure:Math.round(exposure),detail:Math.round(detail),contrast:Math.round(contrast),clipping:Math.round(clipping),overall,detailConfidence:Math.round(detailConfidence),confidence:Math.round(confidence)};
  }

  function labels(m,s){
    const exposure=m.brightPct>=6?'Highlights clipped':m.darkPct>=12?'Shadows blocked':m.mean<82?'Dark overall':m.mean>178?'Bright overall':'Balanced';
    const detail=s.detailConfidence<55?'Inconclusive':s.detail>=74?'Looks crisp':s.detail>=58?'Probably usable':'Check focus';
    const clipping=m.brightPct<2&&m.darkPct<3?'Well protected':m.brightPct>=6?'Protect highlights':m.darkPct>=12?'Protect shadows':'Some clipping';
    const contrast=m.sd<26?'Flat light':m.sd>92?'Very contrasty':'Good separation';
    return{exposure,detail,clipping,contrast};
  }

  function diagnosis(m,s,l){
    const issues=[];
    if(s.detailConfidence>=55&&s.detail<58)issues.push({key:'detail',severity:(100-s.detail)+12,title:'Focus/detail needs attention',short:'Check focus',summary:'The strongest detail regions still look soft at this preview size. Check the selected AF point and protect shutter speed before adding sharpening.'});
    if(m.brightPct>=6)issues.push({key:'highlights',severity:58+m.brightPct*3.2,title:'Protect the highlights',short:'Highlights',summary:'A noticeable part of the frame is near pure white. Reduce exposure a little or change the light if those bright areas matter.'});
    if(m.darkPct>=12)issues.push({key:'shadows',severity:42+m.darkPct*2,title:'Watch the deep shadows',short:'Shadows',summary:'A noticeable part of the frame is near black. Add fill light or expose a little brighter if that shadow detail matters.'});
    if(m.mean<72||m.mean>194)issues.push({key:'exposure',severity:Math.abs(m.mean-128)*.7,title:'Exposure needs attention',short:'Exposure',summary:m.mean<72?'The whole frame is quite dark. Add light, open the aperture, slow the shutter, or raise ISO according to what you need to protect.':'The whole frame is very bright. Lower ISO, use a faster shutter, or use a smaller aperture if highlights matter.'});
    if(m.sd<24)issues.push({key:'contrast',severity:58-m.sd,title:'The light looks flat',short:'Flat light',summary:'There is limited tonal separation. Changing the direction or quality of the light will usually help more than a strong contrast edit.'});
    if(s.detailConfidence<55)issues.push({key:'uncertain',severity:46,title:'Focus/detail is uncertain',short:'Retest focus',summary:'This file is too dark, noisy, clipped, or low-detail for a confident sharpness judgment. Use a brighter controlled test before blaming autofocus.'});
    issues.sort((a,b)=>b.severity-a.severity);
    const primary=issues[0];
    const confidenceLabel=s.confidence>=78?'High confidence':s.confidence>=58?'Medium confidence':'Low confidence';
    if(!primary)return{key:'usable',title:'Technically usable',short:'Usable',summary:'No major technical problem stands out. Keep the capture settings and put your attention on composition, timing, subject placement, and light.',confidenceLabel};
    return{...primary,confidenceLabel};
  }

  function feedback(m,s,l,d){
    const good=[],improve=[];
    if(l.exposure==='Balanced')good.push('Overall brightness is in a usable range.');
    if(l.detail==='Looks crisp')good.push('At least one strong detail region looks crisp at this preview size.');
    else if(l.detail==='Probably usable')good.push('The strongest detail regions look usable, though this check cannot confirm the exact subject plane.');
    if(l.clipping==='Well protected')good.push('Very little extreme highlight or shadow clipping was detected.');
    if(l.contrast==='Good separation')good.push('The image has usable tonal separation.');

    if(d.key==='detail')improve.push('Use one selected AF point on the important detail and keep shutter speed safely fast for the subject.');
    if(d.key==='uncertain')improve.push('Retest focus in brighter light or on a high-contrast detail before changing autofocus settings.');
    if(m.brightPct>=3)improve.push('Some highlights are near pure white. Lower exposure slightly if those areas matter.');
    if(m.darkPct>=6)improve.push('Some shadows are near black. Add fill light or expose brighter if you need that detail.');
    if(m.sd<28)improve.push('Try clearer side light or window light before relying on the contrast slider.');
    if(!improve.length)improve.push('No major technical issue stands out. Improve composition, timing, and light one variable at a time.');
    if(!good.length)good.push('The file is still useful as a technical reference for the next attempt.');
    return{good,improve};
  }

  function analyze(imageData,w,h){
    const raw=pixelStats(imageData,w,h),metrics=scores(raw),metricLabels=labels(raw,metrics),diag=diagnosis(raw,metrics,metricLabels),messages=feedback(raw,metrics,metricLabels,diag);
    return{raw,metrics,labels:metricLabels,diagnosis:diag,messages,version:'2.0.0'};
  }

  window.T7ReviewEngine={analyze,version:'2.0.0'};
  window.dispatchEvent(new CustomEvent('t7-review-engine-ready',{detail:window.T7ReviewEngine}));
})();