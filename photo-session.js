(()=>{
  const fileInput=document.getElementById('fileInput');
  let current=null,loadToken=0;

  function textAt(view,start,count){let s='';for(let i=0;i<count;i++){const c=view.getUint8(start+i);if(c===0)break;s+=String.fromCharCode(c)}return s.trim()}
  function parseExif(buffer){
    try{
      const view=new DataView(buffer);if(view.byteLength<4||view.getUint16(0,false)!==0xFFD8)return{};let offset=2;
      while(offset+4<view.byteLength){
        if(view.getUint8(offset)!==0xFF){offset++;continue}
        const marker=view.getUint8(offset+1);if(marker===0xDA||marker===0xD9)break;
        const size=view.getUint16(offset+2,false);
        if(marker===0xE1&&offset+4+size<=view.byteLength&&textAt(view,offset+4,4)==='Exif'){
          const tiff=offset+10,endian=view.getUint16(tiff,false),little=endian===0x4949;if(!little&&endian!==0x4D4D)return{};
          const u16=p=>view.getUint16(p,little),u32=p=>view.getUint32(p,little),i32=p=>view.getInt32(p,little);if(u16(tiff+2)!==42)return{};
          const typeSize={1:1,2:1,3:2,4:4,5:8,7:1,9:4,10:8};
          function valueAt(entry,type,count){const bytes=(typeSize[type]||1)*count,pos=bytes<=4?entry+8:tiff+u32(entry+8);if(pos<0||pos+Math.max(1,bytes)>view.byteLength)return null;if(type===2)return textAt(view,pos,count);if(type===3)return u16(pos);if(type===4)return u32(pos);if(type===5){const n=u32(pos),d=u32(pos+4);return d?n/d:null}if(type===9)return i32(pos);if(type===10){const n=i32(pos),d=i32(pos+4);return d?n/d:null}return null}
          function readIFD(pos){const out={};if(pos<0||pos+2>view.byteLength)return out;const n=u16(pos);for(let i=0;i<n;i++){const e=pos+2+i*12;if(e+12>view.byteLength)break;const tag=u16(e),type=u16(e+2),count=u32(e+4);out[tag]=valueAt(e,type,count)}return out}
          const root=readIFD(tiff+u32(tiff+4)),exifPtr=root[0x8769],exif=typeof exifPtr==='number'?readIFD(tiff+exifPtr):{};
          return{make:root[0x010F]||'',model:root[0x0110]||'',date:exif[0x9003]||root[0x0132]||'',exposure:exif[0x829A],aperture:exif[0x829D],iso:exif[0x8827],focal:exif[0x920A],lens:exif[0xA434]||''};
        }
        if(!size||size<2)break;offset+=2+size;
      }
    }catch{}
    return{};
  }

  function decode(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not decode this image.'));img.src=url})}
  function makeCanvas(source,maxW=1600,maxH=1200){const sw=source.naturalWidth||source.width,sh=source.naturalHeight||source.height,scale=Math.min(1,maxW/sw,maxH/sh),w=Math.max(1,Math.round(sw*scale)),h=Math.max(1,Math.round(sh*scale)),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(source,0,0,w,h);return c}
  function makeThumb(source){const c=makeCanvas(source,320,320);try{return c.toDataURL('image/jpeg',.62)}catch{return''}}
  function analysisFrame(session,max=520){const src=session.workingCanvas,w0=src.width,h0=src.height,scale=Math.min(1,max/w0,max/h0),w=Math.max(40,Math.round(w0*scale)),h=Math.max(40,Math.round(h0*scale)),c=document.createElement('canvas');c.width=w;c.height=h;const cx=c.getContext('2d',{willReadFrequently:true});cx.drawImage(src,0,0,w,h);return{imageData:cx.getImageData(0,0,w,h),width:w,height:h}}
  function patch(values){if(!current)return null;Object.assign(current,values||{});window.T7Store?.setSession('photo',current);window.dispatchEvent(new CustomEvent('t7-photo-session-updated',{detail:current}));return current}

  async function loadFile(file){
    if(!file)return null;const token=++loadToken;let url='';
    window.dispatchEvent(new CustomEvent('t7-photo-loading',{detail:{file}}));
    try{
      url=URL.createObjectURL(file);const img=await decode(url);if(token!==loadToken){URL.revokeObjectURL(url);return null}
      const width=img.naturalWidth||img.width,height=img.naturalHeight||img.height,workingCanvas=makeCanvas(img,1600,1200),thumb=makeThumb(img);
      let exif={};try{exif=parseExif(await file.arrayBuffer())}catch{}
      if(token!==loadToken){URL.revokeObjectURL(url);return null}
      URL.revokeObjectURL(url);url='';
      const session={id:`${Date.now()}-${file.size}-${file.lastModified||0}`,file,name:file.name,type:file.type,size:file.size,lastModified:file.lastModified||0,width,height,workingCanvas,thumb,exif,analysis:null,createdAt:Date.now()};
      session.analysisFrame=max=>analysisFrame(session,max);current=session;
      window.T7Store?.setSession('photo',current);
      window.dispatchEvent(new CustomEvent('t7-photo-ready',{detail:current}));
      return current;
    }catch(error){if(url)URL.revokeObjectURL(url);window.dispatchEvent(new CustomEvent('t7-photo-error',{detail:{file,error}}));throw error}
  }
  function clear(){loadToken++;current=null;window.T7Store?.setSession('photo',null);window.dispatchEvent(new CustomEvent('t7-photo-cleared'))}

  window.T7PhotoSession={loadFile,current:()=>current,patch,clear,parseExif,version:'1.1.0'};
  if(fileInput)fileInput.addEventListener('change',e=>{const file=e.target.files?.[0];if(file)loadFile(file).catch(console.warn)});
  window.dispatchEvent(new CustomEvent('t7-photo-session-ready',{detail:window.T7PhotoSession}));
})();