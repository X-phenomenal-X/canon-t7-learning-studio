import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const OPENAI_API_KEY=Deno.env.get('OPENAI_API_KEY')||'';
const OPENAI_MODEL=Deno.env.get('OPENAI_MODEL')||'gpt-5.6';
const COACH_PIN=Deno.env.get('COACH_PIN')||'';
const ALLOWED_ORIGIN=Deno.env.get('ALLOWED_ORIGIN')||'https://x-phenomenal-x.github.io';

const schema={
  type:'object',additionalProperties:false,
  properties:{
    summary_title:{type:'string'},summary:{type:'string'},
    composition:{type:'object',additionalProperties:false,properties:{rating:{type:'string',enum:['Strong','Good','Needs work','Unclear']},feedback:{type:'string'}},required:['rating','feedback']},
    lighting:{type:'object',additionalProperties:false,properties:{rating:{type:'string',enum:['Strong','Good','Needs work','Unclear']},feedback:{type:'string'}},required:['rating','feedback']},
    focus:{type:'object',additionalProperties:false,properties:{rating:{type:'string',enum:['Strong','Good','Needs work','Unclear']},confidence:{type:'string',enum:['high','medium','low']},feedback:{type:'string'}},required:['rating','confidence','feedback']},
    background:{type:'object',additionalProperties:false,properties:{rating:{type:'string',enum:['Strong','Good','Needs work','Unclear']},feedback:{type:'string'}},required:['rating','feedback']},
    strengths:{type:'array',items:{type:'string'},minItems:1,maxItems:4},
    watch_next_time:{type:'array',items:{type:'string'},minItems:1,maxItems:4},
    priority_fix:{type:'object',additionalProperties:false,properties:{title:{type:'string'},why:{type:'string'},action:{type:'string'}},required:['title','why','action']},
    t7_next_shot:{type:'object',additionalProperties:false,properties:{mode:{type:'string'},lens:{type:'string'},exposure:{type:'string'},iso:{type:'string'},af_mode:{type:'string'},focus_point:{type:'string'},drive:{type:'string'},change_one_thing:{type:'string'}},required:['mode','lens','exposure','iso','af_mode','focus_point','drive','change_one_thing']}
  },
  required:['summary_title','summary','composition','lighting','focus','background','strengths','watch_next_time','priority_fix','t7_next_shot']
};

function cors(req:Request){
  const origin=req.headers.get('origin')||'';
  const allowed=origin===ALLOWED_ORIGIN||origin.startsWith('http://localhost:')||origin.startsWith('http://127.0.0.1:');
  return {'Access-Control-Allow-Origin':allowed?origin:ALLOWED_ORIGIN,'Vary':'Origin','Access-Control-Allow-Headers':'content-type,x-coach-pin','Access-Control-Allow-Methods':'POST,OPTIONS','Content-Type':'application/json'};
}
function json(req:Request,body:unknown,status=200){return new Response(JSON.stringify(body),{status,headers:cors(req)})}
function outputText(data:any){
  if(typeof data?.output_text==='string')return data.output_text;
  for(const item of data?.output||[])for(const c of item?.content||[])if(c?.type==='output_text'&&typeof c.text==='string')return c.text;
  return '';
}

Deno.serve(async(req:Request)=>{
  if(req.method==='OPTIONS')return new Response(null,{status:204,headers:cors(req)});
  if(req.method!=='POST')return json(req,{error:'Method not allowed'},405);
  if(!OPENAI_API_KEY||!COACH_PIN)return json(req,{error:'AI Coach backend is not configured.'},503);
  const origin=req.headers.get('origin')||'';
  if(origin&&origin!==ALLOWED_ORIGIN&&!origin.startsWith('http://localhost:')&&!origin.startsWith('http://127.0.0.1:'))return json(req,{error:'Origin not allowed'},403);
  const pin=req.headers.get('x-coach-pin')||'';
  if(pin!==COACH_PIN)return json(req,{error:'Incorrect coach PIN.'},401);

  let body:any;try{body=await req.json()}catch{return json(req,{error:'Invalid JSON body.'},400)}
  const image=String(body?.image_data_url||'');
  if(!image.startsWith('data:image/jpeg;base64,')&&!image.startsWith('data:image/png;base64,')&&!image.startsWith('data:image/webp;base64,'))return json(req,{error:'A JPEG, PNG, or WebP image is required.'},400);
  if(image.length>6_500_000)return json(req,{error:'Image is too large. Please use the compressed app upload.'},413);

  const goal=String(body?.goal||'general');
  const exif=body?.exif||{};const technical=body?.technical||{};
  const context=`Shooting goal: ${goal}\nCamera: Canon EOS Rebel T7 with EF-S 18–55mm f/3.5–5.6 IS II\nEXIF shown by app: ${JSON.stringify(exif)}\nOn-device technical check: ${JSON.stringify(technical)}`;
  const instructions=`You are a practical photography coach for a beginner using a Canon EOS Rebel T7 and its 18–55mm kit lens. Analyze the actual photograph, not just the metadata. Focus on composition, lighting direction/quality, subject placement, background distractions, framing, and likely focus/detail quality. Be cautious about focus: a resized image may not prove missed focus, so use the focus confidence field and say Unclear when appropriate. Do not treat creative underexposure, blur, centering, or high contrast as automatically wrong; judge them against the stated shooting goal. Give one priority change first, not a long list. Make the next-shot settings realistic for the Rebel T7: One-Shot AF for still subjects, AI Servo for moving subjects, selected/single AF point when precision matters, about 3 fps continuous drive for action, 2-second timer on tripod work, and useful focal ranges within 18–55mm. Keep advice concise, concrete, and beginner-friendly.`;

  try{
    const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Authorization':`Bearer ${OPENAI_API_KEY}`,'Content-Type':'application/json'},body:JSON.stringify({model:OPENAI_MODEL,store:false,max_output_tokens:1600,instructions,input:[{role:'user',content:[{type:'input_text',text:context},{type:'input_image',image_url:image,detail:'high'}]}],text:{format:{type:'json_schema',name:'t7_photo_coach',description:'Actionable photography feedback for a Canon T7 user',strict:true,schema}}})});
    const data=await r.json();
    if(!r.ok)return json(req,{error:data?.error?.message||'OpenAI request failed.'},502);
    const text=outputText(data);if(!text)return json(req,{error:'AI Coach returned no analysis.'},502);
    let analysis:any;try{analysis=JSON.parse(text)}catch{return json(req,{error:'AI Coach returned an unreadable response.'},502)}
    return json(req,{analysis,model:OPENAI_MODEL},200);
  }catch(err){return json(req,{error:err instanceof Error?err.message:'AI Coach request failed.'},500)}
});