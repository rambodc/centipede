(()=>{CABLES.interActionNeededButton=CABLES.interActionNeededButton||new class{constructor(){this.patch=null,this.fsElement=null,this.callbacks={}}add(t,e,s){this.patch=t,this.callbacks[e]=s,this.show()}remove(t){delete this.callbacks[t],0==Object.keys(this.callbacks).length&&(this.fsElement&&this.fsElement.remove(),this.fsElement=null)}show(){if(!this.fsElement){this.fsElement=document.createElement("div");const t=this.patch.cgl.canvas.parentElement;t&&t.appendChild(this.fsElement),this.fsElement.addEventListener("pointerdown",(t=>{for(const t in this.callbacks)this.callbacks[t]()}))}this.fsElement.style.padding="10px",this.fsElement.style.position="absolute",this.fsElement.style.right="20px",this.fsElement.style.bottom="20px",this.fsElement.style.width="24px",this.fsElement.style.height="24px",this.fsElement.style.cursor="pointer",this.fsElement.style["border-radius"]="40px",this.fsElement.style.background="#444",this.fsElement.style["z-index"]="9999",this.fsElement.style.display="block",this.fsElement.innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="feather feather-volume-2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path></svg>'}},((this.CABLES=this.CABLES||{}).COREMODULES=this.CABLES.COREMODULES||{}).Interactionneededbutton={}.Cables})();