export async function calendarRequest<T>(body?:unknown,query=''):Promise<T>{
 const response=await fetch('/api/calendar'+query,{method:body?'POST':'GET',credentials:'same-origin',cache:'no-store',headers:{Accept:'application/json',...(body?{'Content-Type':'application/json'}:{})},...(body?{body:JSON.stringify(body)}:{})});
 const text=await response.text();
 let data:unknown;
 try{data=JSON.parse(text);}catch{
   console.error('calendar_response_invalid',{status:response.status,contentType:response.headers.get('content-type'),empty:!text.trim(),redirected:response.redirected});
   if(response.status===401||response.status===403||response.redirected)throw Error('Достъпът до календара изисква ново влизане. Презареди страницата и опитай отново.');
   if((body as {action?:string}|undefined)?.action==='commit')throw Error('Не успяхме да потвърдим дали промените са записани. Обнови календара и провери резервацията, преди да опиташ повторно.');
   throw Error('Сървърът върна неочакван отговор. Въведените данни остават във формата; опитай проверката отново.');
 }
 if(!data||typeof data!=='object')throw Error('Непълен отговор от календара. Опитай отново.');
 if(!response.ok){const error=(data as {error?:unknown}).error;throw Error(typeof error==='string'?error:'Не успяхме да изпълним действието. Опитай отново.');}
 if(!Array.isArray((data as {reservations?:unknown}).reservations))throw Error('Непълен отговор от календара. Опитай отново.');
 return data as T;
}
