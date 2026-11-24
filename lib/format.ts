export const money=(v:number|string)=>new Intl.NumberFormat('zh-CN',{style:'currency',currency:'CNY'}).format(Number(v));
export const dt=(v:string)=>new Intl.DateTimeFormat('zh-CN',{dateStyle:'medium',timeStyle:'short',timeZone:'Asia/Shanghai'}).format(new Date(v));
