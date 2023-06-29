(()=>{CABLES.AmmoDebugDrawer=class{constructor(e,t){this.world=e,t=t||{},this.verts=[],this._lineGeom=null,this._lineMesh=null,this.debugDrawMode=t.debugDrawMode||2049,this.index=0,this.enabled=!0,this.debugDrawer=new Ammo.DebugDrawer,this.debugDrawer.drawLine=this.drawLine.bind(this),this.debugDrawer.drawTriangle=this.drawTriangle.bind(this),this.debugDrawer.drawContactPoint=this.drawContactPoint.bind(this),this.debugDrawer.reportErrorWarning=this.reportErrorWarning.bind(this),this.debugDrawer.draw3dText=this.draw3dText.bind(this),this.debugDrawer.setDebugMode=this.setDebugMode.bind(this),this.debugDrawer.getDebugMode=this.getDebugMode.bind(this),this.debugDrawer.enable=this.enable.bind(this),this.debugDrawer.disable=this.disable.bind(this),this.debugDrawer.update=this.update.bind(this),this.debugDrawer.enabled=!0,this.world.setDebugDrawer(this.debugDrawer),this._lineShader=null,this._shaderFrag="".endl()+"precision highp float;".endl()+"IN vec4 vertCol;".endl()+"void main()".endl()+"{".endl()+"    outColor = vertCol;".endl()+"}",this._shaderVert="".endl()+"IN vec3 vPosition;".endl()+"UNI mat4 projMatrix;".endl()+"UNI mat4 mvMatrix;".endl()+"OUT vec4 vertCol;".endl()+"IN vec4 attrVertColor;".endl()+"void main()".endl()+"{".endl()+"   vec4 pos=vec4(vPosition, 1.0);".endl()+"   vertCol=attrVertColor;".endl()+"   gl_PointSize=20.0;".endl()+"   gl_Position = projMatrix * mvMatrix * pos;".endl()+"}"}enable(){this.enabled=!0}disable(){this.enabled=!1}render(e){this.enabled&&(this._lineShader||(this._lineShader=new CGL.Shader(e,"ammoDebugLineShader"),this._lineShader.setSource(this._shaderVert,this._shaderFrag)),this._lineGeom||(this._lineGeom=new CGL.Geometry("ammoDebugLines"),this._lineMesh=new CGL.Mesh(e,this._lineGeom,e.gl.LINES),this._lineMesh.setGeom(this._lineGeom),this._lineGeom.vertices=[],this._pointGeom=new CGL.Geometry("ammoDebugPoints"),this._pointMesh=new CGL.Mesh(e,this._pointGeom,e.gl.LINES),this._pointMesh.setGeom(this._pointGeom),this._pointGeom.vertices=[]),this._lineShader.glPrimitive=e.gl.LINES,this._lineMesh.render(this._lineShader),this._lineShader.glPrimitive=e.gl.POINTS,this._pointMesh.render(this._lineShader))}update(){this._lineGeom&&(this.index=0,this.verts=[],this.vertCols=[],this.indexPoints=0,this.vertPoints=[],this.vertPointCols=[],this.world.debugDrawWorld(),this._lineGeom.setPointVertices(this.verts),this._lineGeom.vertexColors=this.vertCols,this._lineMesh.setGeom(this._lineGeom),this._pointGeom.setPointVertices(this.vertPoints),this._pointGeom.vertexColors=this.vertPointCols,this._pointMesh.setGeom(this._pointGeom))}drawContactPoint(e,t,i,s,r){const n=Ammo.HEAPF32,h=n[(r+0)/4],o=n[(r+4)/4],d=n[(r+8)/4],l=n[(e+0)/4],a=n[(e+4)/4],g=n[(e+8)/4];let m=3*this.indexPoints,w=4*this.indexPoints;this.vertPoints[m+0]=l,this.vertPoints[m+1]=a,this.vertPoints[m+2]=g,this.vertPointCols[w+0]=h,this.vertPointCols[w+1]=o,this.vertPointCols[w+2]=d,this.vertPointCols[w+3]=1,this.indexPoints++}drawTriangle(e,t,i,s){console.log("draw triangle!"),this.drawLine(e,t,s),this.drawLine(t,i,s),this.drawLine(e,i,s)}drawLine(e,t,i){let s=3*this.index,r=4*this.index;const n=Ammo.HEAPF32,h=n[(i+0)/4],o=n[(i+4)/4],d=n[(i+8)/4];this.vertCols[r+0]=h,this.vertCols[r+1]=o,this.vertCols[r+2]=d,this.vertCols[r+3]=.6;const l=n[(e+0)/4],a=n[(e+4)/4],g=n[(e+8)/4];this.verts[s+0]=l,this.verts[s+1]=a,this.verts[s+2]=g;const m=n[(t+0)/4],w=n[(t+4)/4],b=n[(t+8)/4];this.index++,s=3*this.index,r=4*this.index,this.verts[s+0]=m,this.verts[s+1]=w,this.verts[s+2]=b,this.vertCols[r+0]=h,this.vertCols[r+1]=o,this.vertCols[r+2]=d,this.vertCols[r+3]=.6,this.index++}reportErrorWarning(e){Ammo.hasOwnProperty("UTF8ToString")?console.warn(Ammo.UTF8ToString(e)):this.warnedOnce||(this.warnedOnce=!0,console.warn("Cannot print warningString, please export UTF8ToString from Ammo.js in make.py"))}draw3dText(e,t){console.warn("TODO: draw3dText")}setDebugMode(e){this.debugDrawMode=e}getDebugMode(){return this.debugDrawMode}},((this.CABLES=this.CABLES||{}).COREMODULES=this.CABLES.COREMODULES||{}).Ammodebugdrawer={}.Cables})();