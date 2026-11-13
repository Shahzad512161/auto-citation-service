// Auto-fill bookmarklet: the business data is embedded IN the bookmarklet itself,
// because a bookmarklet runs on the directory site's origin and cannot read this
// app's localStorage. Drag it to the bookmarks bar, open a directory form, click it.
export function buildBookmarklet(b) {
  const d = {
    name: b.name || "", phone: b.phone || "", email: b.email || "",
    address: b.address || "", city: b.city || "", state: b.state || "",
    zip: b.zip || "", country: b.country || "", website: b.website_url || "",
    description: b.description || "", category: b.category || "",
  };
  const code = `(function(){var D=${JSON.stringify(d)};var fields=[
    [/business|company|organization|store/i,'name'],[/phone|tel|mobile/i,'phone'],
    [/email|e-mail/i,'email'],[/address|street/i,'address'],[/city|town/i,'city'],
    [/state|province|region/i,'state'],[/zip|postal|postcode/i,'zip'],
    [/country/i,'country'],[/website|url|domain/i,'website'],
    [/description|about|bio|overview/i,'description'],[/categor/i,'category']];
  var n=0;document.querySelectorAll('input,textarea,select').forEach(function(el){
    if(el.type==='hidden'||el.type==='checkbox'||el.type==='radio'||el.type==='submit'||el.type==='button')return;
    var hay=(el.name+' '+el.id+' '+el.placeholder+' '+(el.getAttribute('aria-label')||''));
    for(var i=0;i<fields.length;i++){if(fields[i][0].test(hay)&&D[fields[i][1]]){el.focus();
      var set=Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype,'value').set
        ||Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype,'value').set;
      if(set)set.call(el,D[fields[i][1]]);else el.value=D[fields[i][1]];
      el.dispatchEvent(new Event('input',{bubbles:true}));el.dispatchEvent(new Event('change',{bubbles:true}));n++;break;}}});
  var t=document.createElement('div');t.textContent='Citation Blaster: '+n+' fields auto-filled. Please review, then submit the form yourself.';
  t.style.cssText='position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:999999;background:#0F6FFF;color:#fff;padding:12px 18px;border-radius:10px;font:600 14px sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.3)';
  document.body.appendChild(t);setTimeout(function(){t.remove()},6000);})()`;
  return "javascript:" + code.replace(/\n/g, " ");
}
