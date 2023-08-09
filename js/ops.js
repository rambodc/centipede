"use strict";

var CABLES=CABLES||{};
CABLES.OPS=CABLES.OPS||{};

var Ops=Ops || {};
Ops.Gl=Ops.Gl || {};
Ops.Ui=Ops.Ui || {};
Ops.Net=Ops.Net || {};
Ops.Anim=Ops.Anim || {};
Ops.Html=Ops.Html || {};
Ops.Json=Ops.Json || {};
Ops.Math=Ops.Math || {};
Ops.Time=Ops.Time || {};
Ops.User=Ops.User || {};
Ops.Vars=Ops.Vars || {};
Ops.Array=Ops.Array || {};
Ops.Value=Ops.Value || {};
Ops.Cables=Ops.Cables || {};
Ops.String=Ops.String || {};
Ops.Boolean=Ops.Boolean || {};
Ops.Devices=Ops.Devices || {};
Ops.Sidebar=Ops.Sidebar || {};
Ops.Trigger=Ops.Trigger || {};
Ops.Extension=Ops.Extension || {};
Ops.Gl.Matrix=Ops.Gl.Matrix || {};
Ops.Gl.Meshes=Ops.Gl.Meshes || {};
Ops.Gl.Shader=Ops.Gl.Shader || {};
Ops.Math.Compare=Ops.Math.Compare || {};
Ops.User.rambodc=Ops.User.rambodc || {};
Ops.Devices.Mouse=Ops.Devices.Mouse || {};
Ops.Devices.Keyboard=Ops.Devices.Keyboard || {};
Ops.Extension.ECharts=Ops.Extension.ECharts || {};



// **************************************************************
// 
// Ops.Gl.MainLoop
// 
// **************************************************************

Ops.Gl.MainLoop = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    fpsLimit = op.inValue("FPS Limit", 0),
    trigger = op.outTrigger("trigger"),
    width = op.outNumber("width"),
    height = op.outNumber("height"),
    reduceFocusFPS = op.inValueBool("Reduce FPS not focussed", true),
    reduceLoadingFPS = op.inValueBool("Reduce FPS loading"),
    clear = op.inValueBool("Clear", true),
    clearAlpha = op.inValueBool("ClearAlpha", true),
    fullscreen = op.inValueBool("Fullscreen Button", false),
    active = op.inValueBool("Active", true),
    hdpi = op.inValueBool("Hires Displays", false),
    inUnit = op.inSwitch("Pixel Unit", ["Display", "CSS"], "Display");

op.onAnimFrame = render;
hdpi.onChange = function ()
{
    if (hdpi.get()) op.patch.cgl.pixelDensity = window.devicePixelRatio;
    else op.patch.cgl.pixelDensity = 1;

    op.patch.cgl.updateSize();
    if (CABLES.UI) gui.setLayout();

    // inUnit.setUiAttribs({ "greyout": !hdpi.get() });

    // if (!hdpi.get())inUnit.set("CSS");
    // else inUnit.set("Display");
};

active.onChange = function ()
{
    op.patch.removeOnAnimFrame(op);

    if (active.get())
    {
        op.setUiAttrib({ "extendTitle": "" });
        op.onAnimFrame = render;
        op.patch.addOnAnimFrame(op);
        op.log("adding again!");
    }
    else
    {
        op.setUiAttrib({ "extendTitle": "Inactive" });
    }
};

const cgl = op.patch.cgl;
let rframes = 0;
let rframeStart = 0;

if (!op.patch.cgl) op.uiAttr({ "error": "No webgl cgl context" });

const identTranslate = vec3.create();
vec3.set(identTranslate, 0, 0, 0);
const identTranslateView = vec3.create();
vec3.set(identTranslateView, 0, 0, -2);

fullscreen.onChange = updateFullscreenButton;
setTimeout(updateFullscreenButton, 100);
let fsElement = null;

let winhasFocus = true;
let winVisible = true;

window.addEventListener("blur", () => { winhasFocus = false; });
window.addEventListener("focus", () => { winhasFocus = true; });
document.addEventListener("visibilitychange", () => { winVisible = !document.hidden; });
testMultiMainloop();

inUnit.onChange = () =>
{
    width.set(0);
    height.set(0);
};

function getFpsLimit()
{
    if (reduceLoadingFPS.get() && op.patch.loading.getProgress() < 1.0) return 5;

    if (reduceFocusFPS.get())
    {
        if (!winVisible) return 10;
        if (!winhasFocus) return 30;
    }

    return fpsLimit.get();
}

function updateFullscreenButton()
{
    function onMouseEnter()
    {
        if (fsElement)fsElement.style.display = "block";
    }

    function onMouseLeave()
    {
        if (fsElement)fsElement.style.display = "none";
    }

    op.patch.cgl.canvas.addEventListener("mouseleave", onMouseLeave);
    op.patch.cgl.canvas.addEventListener("mouseenter", onMouseEnter);

    if (fullscreen.get())
    {
        if (!fsElement)
        {
            fsElement = document.createElement("div");

            const container = op.patch.cgl.canvas.parentElement;
            if (container)container.appendChild(fsElement);

            fsElement.addEventListener("mouseenter", onMouseEnter);
            fsElement.addEventListener("click", function (e)
            {
                if (CABLES.UI && !e.shiftKey) gui.cycleFullscreen();
                else cgl.fullScreen();
            });
        }

        fsElement.style.padding = "10px";
        fsElement.style.position = "absolute";
        fsElement.style.right = "5px";
        fsElement.style.top = "5px";
        fsElement.style.width = "20px";
        fsElement.style.height = "20px";
        fsElement.style.cursor = "pointer";
        fsElement.style["border-radius"] = "40px";
        fsElement.style.background = "#444";
        fsElement.style["z-index"] = "9999";
        fsElement.style.display = "none";
        fsElement.innerHTML = "<svg xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" version=\"1.1\" id=\"Capa_1\" x=\"0px\" y=\"0px\" viewBox=\"0 0 490 490\" style=\"width:20px;height:20px;\" xml:space=\"preserve\" width=\"512px\" height=\"512px\"><g><path d=\"M173.792,301.792L21.333,454.251v-80.917c0-5.891-4.776-10.667-10.667-10.667C4.776,362.667,0,367.442,0,373.333V480     c0,5.891,4.776,10.667,10.667,10.667h106.667c5.891,0,10.667-4.776,10.667-10.667s-4.776-10.667-10.667-10.667H36.416     l152.459-152.459c4.093-4.237,3.975-10.99-0.262-15.083C184.479,297.799,177.926,297.799,173.792,301.792z\" fill=\"#FFFFFF\"/><path d=\"M480,0H373.333c-5.891,0-10.667,4.776-10.667,10.667c0,5.891,4.776,10.667,10.667,10.667h80.917L301.792,173.792     c-4.237,4.093-4.354,10.845-0.262,15.083c4.093,4.237,10.845,4.354,15.083,0.262c0.089-0.086,0.176-0.173,0.262-0.262     L469.333,36.416v80.917c0,5.891,4.776,10.667,10.667,10.667s10.667-4.776,10.667-10.667V10.667C490.667,4.776,485.891,0,480,0z\" fill=\"#FFFFFF\"/><path d=\"M36.416,21.333h80.917c5.891,0,10.667-4.776,10.667-10.667C128,4.776,123.224,0,117.333,0H10.667     C4.776,0,0,4.776,0,10.667v106.667C0,123.224,4.776,128,10.667,128c5.891,0,10.667-4.776,10.667-10.667V36.416l152.459,152.459     c4.237,4.093,10.99,3.975,15.083-0.262c3.992-4.134,3.992-10.687,0-14.82L36.416,21.333z\" fill=\"#FFFFFF\"/><path d=\"M480,362.667c-5.891,0-10.667,4.776-10.667,10.667v80.917L316.875,301.792c-4.237-4.093-10.99-3.976-15.083,0.261     c-3.993,4.134-3.993,10.688,0,14.821l152.459,152.459h-80.917c-5.891,0-10.667,4.776-10.667,10.667s4.776,10.667,10.667,10.667     H480c5.891,0,10.667-4.776,10.667-10.667V373.333C490.667,367.442,485.891,362.667,480,362.667z\" fill=\"#FFFFFF\"/></g></svg>";
    }
    else
    {
        if (fsElement)
        {
            fsElement.style.display = "none";
            fsElement.remove();
            fsElement = null;
        }
    }
}

op.onDelete = function ()
{
    cgl.gl.clearColor(0, 0, 0, 0);
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
};

function render(time)
{
    if (!active.get()) return;
    if (cgl.aborted || cgl.canvas.clientWidth === 0 || cgl.canvas.clientHeight === 0) return;

    op.patch.cg = cgl;

    const startTime = performance.now();

    op.patch.config.fpsLimit = getFpsLimit();

    if (cgl.canvasWidth == -1)
    {
        cgl.setCanvas(op.patch.config.glCanvasId);
        return;
    }

    if (cgl.canvasWidth != width.get() || cgl.canvasHeight != height.get())
    {
        let div = 1;
        if (inUnit.get() == "CSS")div = op.patch.cgl.pixelDensity;

        width.set(cgl.canvasWidth / div);
        height.set(cgl.canvasHeight / div);
    }

    if (CABLES.now() - rframeStart > 1000)
    {
        CGL.fpsReport = CGL.fpsReport || [];
        if (op.patch.loading.getProgress() >= 1.0 && rframeStart !== 0)CGL.fpsReport.push(rframes);
        rframes = 0;
        rframeStart = CABLES.now();
    }
    CGL.MESH.lastShader = null;
    CGL.MESH.lastMesh = null;

    cgl.renderStart(cgl, identTranslate, identTranslateView);

    if (clear.get())
    {
        cgl.gl.clearColor(0, 0, 0, 1);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    }

    trigger.trigger();

    if (CGL.MESH.lastMesh)CGL.MESH.lastMesh.unBind();

    if (CGL.Texture.previewTexture)
    {
        if (!CGL.Texture.texturePreviewer) CGL.Texture.texturePreviewer = new CGL.Texture.texturePreview(cgl);
        CGL.Texture.texturePreviewer.render(CGL.Texture.previewTexture);
    }
    cgl.renderEnd(cgl);

    op.patch.cg = null;

    if (clearAlpha.get())
    {
        cgl.gl.clearColor(1, 1, 1, 1);
        cgl.gl.colorMask(false, false, false, true);
        cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT);
        cgl.gl.colorMask(true, true, true, true);
    }

    if (!cgl.frameStore.phong)cgl.frameStore.phong = {};
    rframes++;

    op.patch.cgl.profileData.profileMainloopMs = performance.now() - startTime;
}

function testMultiMainloop()
{
    setTimeout(
        () =>
        {
            if (op.patch.getOpsByObjName(op.name).length > 1)
            {
                op.setUiError("multimainloop", "there should only be one mainloop op!");
                op.patch.addEventListener("onOpDelete", testMultiMainloop);
            }
            else op.setUiError("multimainloop", null, 1);
        }, 500);
}


};

Ops.Gl.MainLoop.prototype = new CABLES.Op();
CABLES.OPS["b0472a1d-db16-4ba6-8787-f300fbdc77bb"]={f:Ops.Gl.MainLoop,objName:"Ops.Gl.MainLoop"};




// **************************************************************
// 
// Ops.Gl.ClearColor
// 
// **************************************************************

Ops.Gl.ClearColor = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    render = op.inTrigger("render"),
    trigger = op.outTrigger("trigger"),
    r = op.inFloatSlider("r", 0.1),
    g = op.inFloatSlider("g", 0.1),
    b = op.inFloatSlider("b", 0.1),
    a = op.inFloatSlider("a", 1);

r.setUiAttribs({ "colorPick": true });

const cgl = op.patch.cgl;

render.onTriggered = function ()
{
    cgl.gl.clearColor(r.get(), g.get(), b.get(), a.get());
    cgl.gl.clear(cgl.gl.COLOR_BUFFER_BIT | cgl.gl.DEPTH_BUFFER_BIT);
    trigger.trigger();
};


};

Ops.Gl.ClearColor.prototype = new CABLES.Op();
CABLES.OPS["19b441eb-9f63-4f35-ba08-b87841517c4d"]={f:Ops.Gl.ClearColor,objName:"Ops.Gl.ClearColor"};




// **************************************************************
// 
// Ops.Gl.Shader.BasicMaterial_v3
// 
// **************************************************************

Ops.Gl.Shader.BasicMaterial_v3 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={"basicmaterial_frag":"{{MODULES_HEAD}}\n\nIN vec2 texCoord;\n\n#ifdef VERTEX_COLORS\nIN vec4 vertCol;\n#endif\n\n#ifdef HAS_TEXTURES\n    IN vec2 texCoordOrig;\n    #ifdef HAS_TEXTURE_DIFFUSE\n        UNI sampler2D tex;\n    #endif\n    #ifdef HAS_TEXTURE_OPACITY\n        UNI sampler2D texOpacity;\n   #endif\n#endif\n\n\n\nvoid main()\n{\n    {{MODULE_BEGIN_FRAG}}\n    vec4 col=color;\n\n\n    #ifdef HAS_TEXTURES\n        vec2 uv=texCoord;\n\n        #ifdef CROP_TEXCOORDS\n            if(uv.x<0.0 || uv.x>1.0 || uv.y<0.0 || uv.y>1.0) discard;\n        #endif\n\n        #ifdef HAS_TEXTURE_DIFFUSE\n            col=texture(tex,uv);\n\n            #ifdef COLORIZE_TEXTURE\n                col.r*=color.r;\n                col.g*=color.g;\n                col.b*=color.b;\n            #endif\n        #endif\n        col.a*=color.a;\n        #ifdef HAS_TEXTURE_OPACITY\n            #ifdef TRANSFORMALPHATEXCOORDS\n                uv=texCoordOrig;\n            #endif\n            #ifdef ALPHA_MASK_IALPHA\n                col.a*=1.0-texture(texOpacity,uv).a;\n            #endif\n            #ifdef ALPHA_MASK_ALPHA\n                col.a*=texture(texOpacity,uv).a;\n            #endif\n            #ifdef ALPHA_MASK_LUMI\n                col.a*=dot(vec3(0.2126,0.7152,0.0722), texture(texOpacity,uv).rgb);\n            #endif\n            #ifdef ALPHA_MASK_R\n                col.a*=texture(texOpacity,uv).r;\n            #endif\n            #ifdef ALPHA_MASK_G\n                col.a*=texture(texOpacity,uv).g;\n            #endif\n            #ifdef ALPHA_MASK_B\n                col.a*=texture(texOpacity,uv).b;\n            #endif\n            // #endif\n        #endif\n    #endif\n\n    {{MODULE_COLOR}}\n\n    #ifdef DISCARDTRANS\n        if(col.a<0.2) discard;\n    #endif\n\n    #ifdef VERTEX_COLORS\n        col*=vertCol;\n    #endif\n\n    outColor = col;\n}\n","basicmaterial_vert":"\n{{MODULES_HEAD}}\n\nOUT vec2 texCoord;\nOUT vec2 texCoordOrig;\n\nUNI mat4 projMatrix;\nUNI mat4 modelMatrix;\nUNI mat4 viewMatrix;\n\n#ifdef HAS_TEXTURES\n    UNI float diffuseRepeatX;\n    UNI float diffuseRepeatY;\n    UNI float texOffsetX;\n    UNI float texOffsetY;\n#endif\n\n#ifdef VERTEX_COLORS\n    in vec4 attrVertColor;\n    out vec4 vertCol;\n\n#endif\n\n\nvoid main()\n{\n    mat4 mMatrix=modelMatrix;\n    mat4 mvMatrix;\n\n    norm=attrVertNormal;\n    texCoordOrig=attrTexCoord;\n    texCoord=attrTexCoord;\n    #ifdef HAS_TEXTURES\n        texCoord.x=texCoord.x*diffuseRepeatX+texOffsetX;\n        texCoord.y=(1.0-texCoord.y)*diffuseRepeatY+texOffsetY;\n    #endif\n\n    #ifdef VERTEX_COLORS\n        vertCol=attrVertColor;\n    #endif\n\n    vec4 pos = vec4(vPosition, 1.0);\n\n    #ifdef BILLBOARD\n       vec3 position=vPosition;\n       mvMatrix=viewMatrix*modelMatrix;\n\n       gl_Position = projMatrix * mvMatrix * vec4((\n           position.x * vec3(\n               mvMatrix[0][0],\n               mvMatrix[1][0],\n               mvMatrix[2][0] ) +\n           position.y * vec3(\n               mvMatrix[0][1],\n               mvMatrix[1][1],\n               mvMatrix[2][1]) ), 1.0);\n    #endif\n\n    {{MODULE_VERTEX_POSITION}}\n\n    #ifndef BILLBOARD\n        mvMatrix=viewMatrix * mMatrix;\n    #endif\n\n\n    #ifndef BILLBOARD\n        // gl_Position = projMatrix * viewMatrix * modelMatrix * pos;\n        gl_Position = projMatrix * mvMatrix * pos;\n    #endif\n}\n",};
const render = op.inTrigger("render");

const trigger = op.outTrigger("trigger");
const shaderOut = op.outObject("shader", null, "shader");

shaderOut.ignoreValueSerialize = true;

op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

const cgl = op.patch.cgl;
const shader = new CGL.Shader(cgl, "basicmaterialnew");
shader.addAttribute({ "type": "vec3", "name": "vPosition" });
shader.addAttribute({ "type": "vec2", "name": "attrTexCoord" });
shader.addAttribute({ "type": "vec3", "name": "attrVertNormal", "nameFrag": "norm" });
shader.addAttribute({ "type": "float", "name": "attrVertIndex" });

shader.setModules(["MODULE_VERTEX_POSITION", "MODULE_COLOR", "MODULE_BEGIN_FRAG"]);

shader.setSource(attachments.basicmaterial_vert, attachments.basicmaterial_frag);

shaderOut.setRef(shader);

render.onTriggered = doRender;

// rgba colors
const r = op.inValueSlider("r", Math.random());
const g = op.inValueSlider("g", Math.random());
const b = op.inValueSlider("b", Math.random());
const a = op.inValueSlider("a", 1);
r.setUiAttribs({ "colorPick": true });

// const uniColor=new CGL.Uniform(shader,'4f','color',r,g,b,a);
const colUni = shader.addUniformFrag("4f", "color", r, g, b, a);

shader.uniformColorDiffuse = colUni;

// diffuse outTexture

const diffuseTexture = op.inTexture("texture");
let diffuseTextureUniform = null;
diffuseTexture.onChange = updateDiffuseTexture;

const colorizeTexture = op.inValueBool("colorizeTexture", false);
const vertexColors = op.inValueBool("Vertex Colors", false);

// opacity texture
const textureOpacity = op.inTexture("textureOpacity");
let textureOpacityUniform = null;

const alphaMaskSource = op.inSwitch("Alpha Mask Source", ["Luminance", "R", "G", "B", "A", "1-A"], "Luminance");
alphaMaskSource.setUiAttribs({ "greyout": true });
textureOpacity.onChange = updateOpacity;

const texCoordAlpha = op.inValueBool("Opacity TexCoords Transform", false);
const discardTransPxl = op.inValueBool("Discard Transparent Pixels");

// texture coords
const
    diffuseRepeatX = op.inValue("diffuseRepeatX", 1),
    diffuseRepeatY = op.inValue("diffuseRepeatY", 1),
    diffuseOffsetX = op.inValue("Tex Offset X", 0),
    diffuseOffsetY = op.inValue("Tex Offset Y", 0),
    cropRepeat = op.inBool("Crop TexCoords", false);

shader.addUniformFrag("f", "diffuseRepeatX", diffuseRepeatX);
shader.addUniformFrag("f", "diffuseRepeatY", diffuseRepeatY);
shader.addUniformFrag("f", "texOffsetX", diffuseOffsetX);
shader.addUniformFrag("f", "texOffsetY", diffuseOffsetY);

const doBillboard = op.inValueBool("billboard", false);

alphaMaskSource.onChange =
    doBillboard.onChange =
    discardTransPxl.onChange =
    texCoordAlpha.onChange =
    cropRepeat.onChange =
    vertexColors.onChange =
    colorizeTexture.onChange = updateDefines;

op.setPortGroup("Color", [r, g, b, a]);
op.setPortGroup("Color Texture", [diffuseTexture, vertexColors, colorizeTexture]);
op.setPortGroup("Opacity", [textureOpacity, alphaMaskSource, discardTransPxl, texCoordAlpha]);
op.setPortGroup("Texture Transform", [diffuseRepeatX, diffuseRepeatY, diffuseOffsetX, diffuseOffsetY, cropRepeat]);

updateOpacity();
updateDiffuseTexture();

op.preRender = function ()
{
    shader.bind();
    doRender();
};

function doRender()
{
    if (!shader) return;

    cgl.pushShader(shader);
    shader.popTextures();

    if (diffuseTextureUniform && diffuseTexture.get()) shader.pushTexture(diffuseTextureUniform, diffuseTexture.get());
    if (textureOpacityUniform && textureOpacity.get()) shader.pushTexture(textureOpacityUniform, textureOpacity.get());

    trigger.trigger();

    cgl.popShader();
}

function updateOpacity()
{
    if (textureOpacity.get())
    {
        if (textureOpacityUniform !== null) return;
        shader.removeUniform("texOpacity");
        shader.define("HAS_TEXTURE_OPACITY");
        if (!textureOpacityUniform)textureOpacityUniform = new CGL.Uniform(shader, "t", "texOpacity");

        alphaMaskSource.setUiAttribs({ "greyout": false });
        texCoordAlpha.setUiAttribs({ "greyout": false });
    }
    else
    {
        shader.removeUniform("texOpacity");
        shader.removeDefine("HAS_TEXTURE_OPACITY");
        textureOpacityUniform = null;

        alphaMaskSource.setUiAttribs({ "greyout": true });
        texCoordAlpha.setUiAttribs({ "greyout": true });
    }

    updateDefines();
}

function updateDiffuseTexture()
{
    if (diffuseTexture.get())
    {
        if (!shader.hasDefine("HAS_TEXTURE_DIFFUSE"))shader.define("HAS_TEXTURE_DIFFUSE");
        if (!diffuseTextureUniform)diffuseTextureUniform = new CGL.Uniform(shader, "t", "texDiffuse");

        diffuseRepeatX.setUiAttribs({ "greyout": false });
        diffuseRepeatY.setUiAttribs({ "greyout": false });
        diffuseOffsetX.setUiAttribs({ "greyout": false });
        diffuseOffsetY.setUiAttribs({ "greyout": false });
        colorizeTexture.setUiAttribs({ "greyout": false });
    }
    else
    {
        shader.removeUniform("texDiffuse");
        shader.removeDefine("HAS_TEXTURE_DIFFUSE");
        diffuseTextureUniform = null;

        diffuseRepeatX.setUiAttribs({ "greyout": true });
        diffuseRepeatY.setUiAttribs({ "greyout": true });
        diffuseOffsetX.setUiAttribs({ "greyout": true });
        diffuseOffsetY.setUiAttribs({ "greyout": true });
        colorizeTexture.setUiAttribs({ "greyout": true });
    }
}

function updateDefines()
{
    shader.toggleDefine("VERTEX_COLORS", vertexColors.get());
    shader.toggleDefine("CROP_TEXCOORDS", cropRepeat.get());
    shader.toggleDefine("COLORIZE_TEXTURE", colorizeTexture.get());
    shader.toggleDefine("TRANSFORMALPHATEXCOORDS", texCoordAlpha.get());
    shader.toggleDefine("DISCARDTRANS", discardTransPxl.get());
    shader.toggleDefine("BILLBOARD", doBillboard.get());

    shader.toggleDefine("ALPHA_MASK_ALPHA", alphaMaskSource.get() == "A");
    shader.toggleDefine("ALPHA_MASK_IALPHA", alphaMaskSource.get() == "1-A");
    shader.toggleDefine("ALPHA_MASK_LUMI", alphaMaskSource.get() == "Luminance");
    shader.toggleDefine("ALPHA_MASK_R", alphaMaskSource.get() == "R");
    shader.toggleDefine("ALPHA_MASK_G", alphaMaskSource.get() == "G");
    shader.toggleDefine("ALPHA_MASK_B", alphaMaskSource.get() == "B");
}


};

Ops.Gl.Shader.BasicMaterial_v3.prototype = new CABLES.Op();
CABLES.OPS["ec55d252-3843-41b1-b731-0482dbd9e72b"]={f:Ops.Gl.Shader.BasicMaterial_v3,objName:"Ops.Gl.Shader.BasicMaterial_v3"};




// **************************************************************
// 
// Ops.Gl.Texture_v2
// 
// **************************************************************

Ops.Gl.Texture_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    filename = op.inUrl("File", [".jpg", ".png", ".webp", ".jpeg", ".avif"]),
    tfilter = op.inSwitch("Filter", ["nearest", "linear", "mipmap"]),
    wrap = op.inValueSelect("Wrap", ["repeat", "mirrored repeat", "clamp to edge"], "clamp to edge"),
    aniso = op.inSwitch("Anisotropic", ["0", "1", "2", "4", "8", "16"], "0"),
    flip = op.inValueBool("Flip", false),
    unpackAlpha = op.inValueBool("Pre Multiplied Alpha", false),
    active = op.inValueBool("Active", true),
    inFreeMemory = op.inBool("Save Memory", true),
    textureOut = op.outTexture("Texture"),
    width = op.outNumber("Width"),
    height = op.outNumber("Height"),
    ratio = op.outNumber("Aspect Ratio"),
    loaded = op.outNumber("Loaded", false),
    loading = op.outNumber("Loading", false);

const cgl = op.patch.cgl;

op.toWorkPortsNeedToBeLinked(textureOut);
op.setPortGroup("Size", [width, height]);

let loadedFilename = null;
let loadingId = null;
let tex = null;
let cgl_filter = CGL.Texture.FILTER_MIPMAP;
let cgl_wrap = CGL.Texture.WRAP_REPEAT;
let cgl_aniso = 0;
let timedLoader = 0;

unpackAlpha.setUiAttribs({ "hidePort": true });
unpackAlpha.onChange =
    filename.onChange =
    flip.onChange = reloadSoon;
aniso.onChange = tfilter.onChange = onFilterChange;
wrap.onChange = onWrapChange;

tfilter.set("mipmap");
wrap.set("repeat");

textureOut.set(CGL.Texture.getEmptyTexture(cgl));

active.onChange = function ()
{
    if (active.get())
    {
        if (loadedFilename != filename.get() || !tex) reloadSoon();
        else textureOut.set(tex);
    }
    else
    {
        textureOut.set(CGL.Texture.getEmptyTexture(cgl));
        width.set(CGL.Texture.getEmptyTexture(cgl).width);
        height.set(CGL.Texture.getEmptyTexture(cgl).height);
        if (tex)tex.delete();
        op.setUiAttrib({ "extendTitle": "" });
        tex = null;
    }
};

const setTempTexture = function ()
{
    const t = CGL.Texture.getTempTexture(cgl);
    textureOut.set(t);
};

function reloadSoon(nocache)
{
    clearTimeout(timedLoader);
    timedLoader = setTimeout(function ()
    {
        realReload(nocache);
    }, 30);
}

function realReload(nocache)
{
    if (!active.get()) return;
    // if (filename.get() === null) return;
    if (loadingId)loadingId = cgl.patch.loading.finished(loadingId);
    loadingId = cgl.patch.loading.start("textureOp", filename.get(), op);

    let url = op.patch.getFilePath(String(filename.get()));

    if (nocache)url += "?rnd=" + CABLES.uuid();

    if (String(filename.get()).indexOf("data:") == 0) url = filename.get();

    let needsRefresh = false;
    if (loadedFilename != filename.get()) needsRefresh = true;
    loadedFilename = filename.get();

    if ((filename.get() && filename.get().length > 1))
    {
        loaded.set(false);
        loading.set(true);

        const fileToLoad = filename.get();

        op.setUiAttrib({ "extendTitle": CABLES.basename(url) });
        if (needsRefresh) op.refreshParams();

        cgl.patch.loading.addAssetLoadingTask(() =>
        {
            op.setUiError("urlerror", null);

            CGL.Texture.load(cgl, url,
                function (err, newTex)
                {
                    cgl.checkFrameStarted("texture inittexture");

                    if (filename.get() != fileToLoad)
                    {
                        cgl.patch.loading.finished(loadingId);
                        loadingId = null;
                        return;
                    }

                    if (err)
                    {
                        setTempTexture();
                        op.setUiError("urlerror", "could not load texture: \"" + filename.get() + "\"", 2);
                        cgl.patch.loading.finished(loadingId);
                        loadingId = null;
                        return;
                    }

                    textureOut.set(newTex);

                    width.set(newTex.width);
                    height.set(newTex.height);
                    ratio.set(newTex.width / newTex.height);

                    // if (!newTex.isPowerOfTwo()) op.setUiError("npot", "Texture dimensions not power of two! - Texture filtering will not work in WebGL 1.", 0);
                    // else op.setUiError("npot", null);

                    if (tex)tex.delete();
                    tex = newTex;
                    // textureOut.set(null);
                    textureOut.setRef(tex);

                    loading.set(false);
                    loaded.set(true);

                    if (inFreeMemory.get()) tex.image = null;

                    if (loadingId)
                    {
                        cgl.patch.loading.finished(loadingId);
                        loadingId = null;
                    }
                    // testTexture();
                }, {
                    "anisotropic": cgl_aniso,
                    "wrap": cgl_wrap,
                    "flip": flip.get(),
                    "unpackAlpha": unpackAlpha.get(),
                    "filter": cgl_filter
                });

            // textureOut.set(null);
            // textureOut.set(tex);
        });
    }
    else
    {
        cgl.patch.loading.finished(loadingId);
        loadingId = null;
        setTempTexture();
    }
}

function onFilterChange()
{
    if (tfilter.get() == "nearest") cgl_filter = CGL.Texture.FILTER_NEAREST;
    else if (tfilter.get() == "linear") cgl_filter = CGL.Texture.FILTER_LINEAR;
    else if (tfilter.get() == "mipmap") cgl_filter = CGL.Texture.FILTER_MIPMAP;
    else if (tfilter.get() == "Anisotropic") cgl_filter = CGL.Texture.FILTER_ANISOTROPIC;

    aniso.setUiAttribs({ "greyout": cgl_filter != CGL.Texture.FILTER_MIPMAP });

    cgl_aniso = parseFloat(aniso.get());

    reloadSoon();
}

function onWrapChange()
{
    if (wrap.get() == "repeat") cgl_wrap = CGL.Texture.WRAP_REPEAT;
    if (wrap.get() == "mirrored repeat") cgl_wrap = CGL.Texture.WRAP_MIRRORED_REPEAT;
    if (wrap.get() == "clamp to edge") cgl_wrap = CGL.Texture.WRAP_CLAMP_TO_EDGE;

    reloadSoon();
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1)
    {
        textureOut.set(CGL.Texture.getEmptyTexture(op.patch.cgl));
        textureOut.set(CGL.Texture.getTempTexture(cgl));
        realReload(true);
    }
};

// function testTexture()
// {
//     cgl.setTexture(0, tex.tex);

//     const filter = cgl.gl.getTexParameter(cgl.gl.TEXTURE_2D, cgl.gl.TEXTURE_MIN_FILTER);
//     const wrap = cgl.gl.getTexParameter(cgl.gl.TEXTURE_2D, cgl.gl.TEXTURE_WRAP_S);

//     if (cgl_filter === CGL.Texture.FILTER_MIPMAP && filter != cgl.gl.LINEAR_MIPMAP_LINEAR) console.log("wrong texture filter!", filename.get());
//     if (cgl_filter === CGL.Texture.FILTER_NEAREST && filter != cgl.gl.NEAREST) console.log("wrong texture filter!", filename.get());
//     if (cgl_filter === CGL.Texture.FILTER_LINEAR && filter != cgl.gl.LINEAR) console.log("wrong texture filter!", filename.get());

//     if (cgl_wrap === CGL.Texture.WRAP_REPEAT && wrap != cgl.gl.REPEAT) console.log("wrong texture wrap1!", filename.get());
//     if (cgl_wrap === CGL.Texture.WRAP_MIRRORED_REPEAT && wrap != cgl.gl.MIRRORED_REPEAT) console.log("wrong texture wrap2!", filename.get());
//     if (cgl_wrap === CGL.Texture.WRAP_CLAMP_TO_EDGE && wrap != cgl.gl.CLAMP_TO_EDGE) console.log("wrong texture wrap3!", filename.get());
// }


};

Ops.Gl.Texture_v2.prototype = new CABLES.Op();
CABLES.OPS["790f3702-9833-464e-8e37-6f0f813f7e16"]={f:Ops.Gl.Texture_v2,objName:"Ops.Gl.Texture_v2"};




// **************************************************************
// 
// Ops.Sidebar.SideBarStyle
// 
// **************************************************************

Ops.Sidebar.SideBarStyle = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const parentPort = op.inObject("link"),
    inWidth = op.inInt("Width", 220),
    inBorderRadius = op.inFloat("Round Corners", 10),
    inColorSpecial = op.inString("Special Color", "#07f78c"),

    siblingsPort = op.outObject("childs");

inColorSpecial.onChange =
inBorderRadius.onChange =
inWidth.onChange = setStyle;

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

let sideBarEle = null;

function setStyle()
{
    if (!sideBarEle) return;

    sideBarEle.style.setProperty("--sidebar-width", inWidth.get() + "px");

    sideBarEle.style.setProperty("--sidebar-color", inColorSpecial.get());

    sideBarEle.style.setProperty("--sidebar-border-radius", Math.round(inBorderRadius.get()) + "px");

    op.patch.emitEvent("sidebarStylesChanged");
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        siblingsPort.set(parent);
        sideBarEle = parent.parentElement.parentElement;
        setStyle();
    }
    else
    {
        sideBarEle = null;
    }
}

function showElement(el)
{
    if (!el) return;
    el.style.display = "block";
}

function hideElement(el)
{
    if (!el) return;
    el.style.display = "none";
}

function onDelete()
{
}


};

Ops.Sidebar.SideBarStyle.prototype = new CABLES.Op();
CABLES.OPS["87d78a59-c8d4-4269-a3f8-af273741aae4"]={f:Ops.Sidebar.SideBarStyle,objName:"Ops.Sidebar.SideBarStyle"};




// **************************************************************
// 
// Ops.Gl.Meshes.Grid
// 
// **************************************************************

Ops.Gl.Meshes.Grid = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    render = op.inTrigger("Render"),
    inNum = op.inValue("Num", 10),
    inSpacing = op.inValue("Spacing", 1),
    inCenter = op.inBool("Center", true),
    next = op.outTrigger("Next");

const cgl = op.patch.cgl;
let mesh = null;

inCenter.onChange =
    inNum.onChange =
    inSpacing.onChange = function ()
    {
        if (mesh)mesh.dispose();
        mesh = null;
    };

function init()
{
    const geomStepsOne = new CGL.Geometry(op.name);
    const geomX = new CGL.Geometry(op.name);

    const space = inSpacing.get();
    const num = Math.floor(inNum.get());
    const l = space * num / 2;

    const tc = [];

    let start = -num / 2;
    let end = num / 2 + 1;

    for (let i = start; i < end; i++)
    {
        geomStepsOne.vertices.push(-l);
        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(l);
        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(-l);
        geomStepsOne.vertices.push(0);

        geomStepsOne.vertices.push(i * space);
        geomStepsOne.vertices.push(l);
        geomStepsOne.vertices.push(0);

        tc.push(0, 0);
        tc.push(0, 0);
        tc.push(0, 0);
        tc.push(0, 0);
    }

    if (!inCenter.get())
    {
        for (let i = 0; i < geomStepsOne.vertices.length; i += 3)
        {
            geomStepsOne.vertices[i + 0] += l;
            geomStepsOne.vertices[i + 1] += l;
        }
    }

    geomStepsOne.setTexCoords(tc);
    geomStepsOne.calculateNormals();

    if (!mesh) mesh = new CGL.Mesh(cgl, geomStepsOne);
    else mesh.setGeom(geomStepsOne);
}

render.onTriggered = function ()
{
    if (!mesh)init();
    let shader = cgl.getShader();
    if (!shader) return;

    let oldPrim = shader.glPrimitive;

    shader.glPrimitive = cgl.gl.LINES;

    mesh.render(shader);

    shader.glPrimitive = oldPrim;

    next.trigger();
};


};

Ops.Gl.Meshes.Grid.prototype = new CABLES.Op();
CABLES.OPS["677a7c03-6885-46b4-8a64-e4ea54ee5d7f"]={f:Ops.Gl.Meshes.Grid,objName:"Ops.Gl.Meshes.Grid"};




// **************************************************************
// 
// Ops.Array.StringToArray_v2
// 
// **************************************************************

Ops.Array.StringToArray_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const text = op.inStringEditor("text", "1,2,3"),
    separator = op.inString("separator", ","),
    toNumber = op.inValueBool("Numbers", true),
    trim = op.inValueBool("Trim", true),
    splitNewLines = op.inBool("Split Lines", false),
    parsed = op.outTrigger("Parsed"),
    arr = op.outArray("array"),
    len = op.outNumber("length");

text.setUiAttribs({ "ignoreBigPort": true });

text.onChange = separator.onChange = toNumber.onChange = trim.onChange = parse;

splitNewLines.onChange = () =>
{
    separator.setUiAttribs({ "greyout": splitNewLines.get() });
    parse();
};

parse();

function parse()
{
    if (!text.get())
    {
        arr.set(null);
        arr.set([]);
        len.set(0);
        return;
    }

    let textInput = text.get();
    if (trim.get() && textInput)
    {
        textInput = textInput.replace(/^\s+|\s+$/g, "");
        textInput = textInput.trim();
    }

    let r;
    let sep = separator.get();
    if (separator.get() === "\\n") sep = "\n";
    if (splitNewLines.get()) r = textInput.split("\n");
    else r = textInput.split(sep);

    if (r[r.length - 1] === "") r.length -= 1;

    len.set(r.length);

    if (trim.get())
    {
        for (let i = 0; i < r.length; i++)
        {
            r[i] = r[i].replace(/^\s+|\s+$/g, "");
            r[i] = r[i].trim();
        }
    }

    op.setUiError("notnum", null);
    if (toNumber.get())
    {
        let hasStrings = false;
        for (let i = 0; i < r.length; i++)
        {
            r[i] = Number(r[i]);
            if (!CABLES.UTILS.isNumeric(r[i]))
            {
                hasStrings = true;
            }
        }
        if (hasStrings)
        {
            op.setUiError("notnum", "Parse Error / Not all values numerical!");
        }
    }

    // arr.set(null);
    arr.setRef(r);
    parsed.trigger();
}


};

Ops.Array.StringToArray_v2.prototype = new CABLES.Op();
CABLES.OPS["c974de41-4ce4-4432-b94d-724741109c71"]={f:Ops.Array.StringToArray_v2,objName:"Ops.Array.StringToArray_v2"};




// **************************************************************
// 
// Ops.Sidebar.Group
// 
// **************************************************************

Ops.Sidebar.Group = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
let parentPort = op.inObject("link");
let labelPort = op.inString("Text", "Group");
const inShowTitle = op.inBool("Show Title", true);
let defaultMinimizedPort = op.inValueBool("Default Minimized");
const inVisible = op.inBool("Visible", true);

// outputs
let nextPort = op.outObject("next");
let childrenPort = op.outObject("childs");

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

// vars
let el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("sidebar__group");
onDefaultMinimizedPortChanged();
let header = document.createElement("div");
header.classList.add("sidebar__group-header");
header.classList.add("cablesEle");
el.appendChild(header);
header.addEventListener("click", onClick);
let headerTitle = document.createElement("div");
headerTitle.classList.add("sidebar__group-header-title");
// headerTitle.textContent = labelPort.get();
header.appendChild(headerTitle);
let headerTitleText = document.createElement("span");
headerTitleText.textContent = labelPort.get();
headerTitleText.classList.add("sidebar__group-header-title-text");
headerTitle.appendChild(headerTitleText);
let icon = document.createElement("span");
icon.classList.add("sidebar__group-header-icon");
icon.classList.add("iconsidebar-chevron-up");
headerTitle.appendChild(icon);
let groupItems = document.createElement("div");
groupItems.classList.add("sidebar__group-items");
el.appendChild(groupItems);
op.toWorkPortsNeedToBeLinked(parentPort);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultMinimizedPort.onChange = onDefaultMinimizedPortChanged;
op.onDelete = onDelete;

// functions

inShowTitle.onChange = () =>
{
    if (inShowTitle.get())header.style.display = "block";
    else header.style.display = "none";
};

function onDefaultMinimizedPortChanged()
{
    if (defaultMinimizedPort.get())
    {
        el.classList.add("sidebar__group--closed");
    }
    else
    {
        el.classList.remove("sidebar__group--closed");
    }
}

function onClick(ev)
{
    ev.stopPropagation();
    el.classList.toggle("sidebar__group--closed");
}

function onLabelTextChanged()
{
    let labelText = labelPort.get();
    headerTitleText.textContent = labelText;
    if (CABLES.UI)
    {
        op.setTitle("Group: " + labelText);
    }
}

function onParentChanged()
{
    childrenPort.set(null);
    let parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        childrenPort.set({
            "parentElement": groupItems,
            "parentOp": op,
        });
        nextPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.Sidebar.Group.prototype = new CABLES.Op();
CABLES.OPS["86ea2333-b51c-48ed-94c2-8b7b6e9ff34c"]={f:Ops.Sidebar.Group,objName:"Ops.Sidebar.Group"};




// **************************************************************
// 
// Ops.Gl.Matrix.Transform
// 
// **************************************************************

Ops.Gl.Matrix.Transform = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    render = op.inTrigger("render"),
    posX = op.inValue("posX", 0),
    posY = op.inValue("posY", 0),
    posZ = op.inValue("posZ", 0),
    scale = op.inValue("scale", 1),
    rotX = op.inValue("rotX", 0),
    rotY = op.inValue("rotY", 0),
    rotZ = op.inValue("rotZ", 0),
    trigger = op.outTrigger("trigger");

op.setPortGroup("Rotation", [rotX, rotY, rotZ]);
op.setPortGroup("Position", [posX, posY, posZ]);
op.setPortGroup("Scale", [scale]);
op.setUiAxisPorts(posX, posY, posZ);

op.toWorkPortsNeedToBeLinked(render, trigger);

const vPos = vec3.create();
const vScale = vec3.create();
const transMatrix = mat4.create();
mat4.identity(transMatrix);

let
    doScale = false,
    doTranslate = false,
    translationChanged = true,
    scaleChanged = true,
    rotChanged = true;

rotX.onChange = rotY.onChange = rotZ.onChange = setRotChanged;
posX.onChange = posY.onChange = posZ.onChange = setTranslateChanged;
scale.onChange = setScaleChanged;

render.onTriggered = function ()
{
    // if(!CGL.TextureEffect.checkOpNotInTextureEffect(op)) return;

    let updateMatrix = false;
    if (translationChanged)
    {
        updateTranslation();
        updateMatrix = true;
    }
    if (scaleChanged)
    {
        updateScale();
        updateMatrix = true;
    }
    if (rotChanged) updateMatrix = true;

    if (updateMatrix) doUpdateMatrix();

    const cg = op.patch.cgl;
    cg.pushModelMatrix();
    mat4.multiply(cg.mMatrix, cg.mMatrix, transMatrix);

    trigger.trigger();
    cg.popModelMatrix();

    if (CABLES.UI && CABLES.UI.showCanvasTransforms) gui.setTransform(op.id, posX.get(), posY.get(), posZ.get());

    if (op.isCurrentUiOp())
        gui.setTransformGizmo(
            {
                "posX": posX,
                "posY": posY,
                "posZ": posZ,
            });
};

op.transform3d = function ()
{
    return { "pos": [posX, posY, posZ] };
};

function doUpdateMatrix()
{
    mat4.identity(transMatrix);
    if (doTranslate)mat4.translate(transMatrix, transMatrix, vPos);

    if (rotX.get() !== 0)mat4.rotateX(transMatrix, transMatrix, rotX.get() * CGL.DEG2RAD);
    if (rotY.get() !== 0)mat4.rotateY(transMatrix, transMatrix, rotY.get() * CGL.DEG2RAD);
    if (rotZ.get() !== 0)mat4.rotateZ(transMatrix, transMatrix, rotZ.get() * CGL.DEG2RAD);

    if (doScale)mat4.scale(transMatrix, transMatrix, vScale);
    rotChanged = false;
}

function updateTranslation()
{
    doTranslate = false;
    if (posX.get() !== 0.0 || posY.get() !== 0.0 || posZ.get() !== 0.0) doTranslate = true;
    vec3.set(vPos, posX.get(), posY.get(), posZ.get());
    translationChanged = false;
}

function updateScale()
{
    // doScale=false;
    // if(scale.get()!==0.0)
    doScale = true;
    vec3.set(vScale, scale.get(), scale.get(), scale.get());
    scaleChanged = false;
}

function setTranslateChanged()
{
    translationChanged = true;
}

function setScaleChanged()
{
    scaleChanged = true;
}

function setRotChanged()
{
    rotChanged = true;
}

doUpdateMatrix();


};

Ops.Gl.Matrix.Transform.prototype = new CABLES.Op();
CABLES.OPS["650baeb1-db2d-4781-9af6-ab4e9d4277be"]={f:Ops.Gl.Matrix.Transform,objName:"Ops.Gl.Matrix.Transform"};




// **************************************************************
// 
// Ops.Sidebar.Sidebar
// 
// **************************************************************

Ops.Sidebar.Sidebar = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={"style_css":" /*\n * SIDEBAR\n  http://danielstern.ca/range.css/#/\n  https://developer.mozilla.org/en-US/docs/Web/CSS/::-webkit-progress-value\n */\n\n.sidebar-icon-undo\n{\n    width:10px;\n    height:10px;\n    background-image: url(\"data:image/svg+xml;charset=utf8, %3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='none' stroke='grey' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M3 7v6h6'/%3E%3Cpath d='M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13'/%3E%3C/svg%3E\");\n    background-size: 19px;\n    background-repeat: no-repeat;\n    top: -19px;\n    margin-top: -7px;\n}\n\n.icon-chevron-down {\n    top: 2px;\n    right: 9px;\n}\n\n.iconsidebar-chevron-up,.sidebar__close-button {\n\tbackground-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n}\n\n.iconsidebar-minimizebutton {\n    background-position: 98% center;\n    background-repeat: no-repeat;\n}\n\n.sidebar-cables-right\n{\n    right: 15px;\n    left: initial !important;\n}\n\n.sidebar-cables {\n    --sidebar-color: #07f78c;\n    --sidebar-width: 220px;\n    --sidebar-border-radius: 10px;\n    --sidebar-monospace-font-stack: \"SFMono-Regular\", Consolas, \"Liberation Mono\", Menlo, Courier, monospace;\n    --sidebar-hover-transition-time: .2s;\n\n    position: absolute;\n    top: 15px;\n    left: 15px;\n    border-radius: var(--sidebar-border-radius);\n    z-index: 100000;\n    color: #BBBBBB;\n    width: var(  --sidebar-width);\n    max-height: 100%;\n    box-sizing: border-box;\n    overflow-y: auto;\n    overflow-x: hidden;\n    font-size: 13px;\n    font-family: Arial;\n    line-height: 1em; /* prevent emojis from breaking height of the title */\n}\n\n.sidebar-cables::selection {\n    background-color: var(--sidebar-color);\n    color: #EEEEEE;\n}\n\n.sidebar-cables::-webkit-scrollbar {\n    background-color: transparent;\n    --cables-scrollbar-width: 8px;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables::-webkit-scrollbar-track {\n    background-color: transparent;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables::-webkit-scrollbar-thumb {\n    background-color: #333333;\n    border-radius: 4px;\n    width: var(--cables-scrollbar-width);\n}\n\n.sidebar-cables--closed {\n    width: auto;\n}\n\n.sidebar__close-button {\n    background-color: #222;\n    /*-webkit-user-select: none;  */\n    /*-moz-user-select: none;     */\n    /*-ms-user-select: none;      */\n    /*user-select: none;          */\n    /*transition: background-color var(--sidebar-hover-transition-time);*/\n    /*color: #CCCCCC;*/\n    height: 2px;\n    /*border-bottom:20px solid #222;*/\n\n    /*box-sizing: border-box;*/\n    /*padding-top: 2px;*/\n    /*text-align: center;*/\n    /*cursor: pointer;*/\n    /*border-radius: 0 0 var(--sidebar-border-radius) var(--sidebar-border-radius);*/\n    /*opacity: 1.0;*/\n    /*transition: opacity 0.3s;*/\n    /*overflow: hidden;*/\n}\n\n.sidebar__close-button-icon {\n    display: inline-block;\n    /*opacity: 0;*/\n    width: 20px;\n    height: 20px;\n    /*position: relative;*/\n    /*top: -1px;*/\n\n\n}\n\n.sidebar--closed {\n    width: auto;\n    margin-right: 20px;\n}\n\n.sidebar--closed .sidebar__close-button {\n    margin-top: 8px;\n    margin-left: 8px;\n    padding:10px;\n\n    height: 25px;\n    width:25px;\n    border-radius: 50%;\n    cursor: pointer;\n    opacity: 0.3;\n    background-repeat: no-repeat;\n    background-position: center center;\n    transform:rotate(180deg);\n}\n\n.sidebar--closed .sidebar__group\n{\n    display:none;\n\n}\n.sidebar--closed .sidebar__close-button-icon {\n    background-position: 0px 0px;\n}\n\n.sidebar__close-button:hover {\n    background-color: #111111;\n    opacity: 1.0 !important;\n}\n\n/*\n * SIDEBAR ITEMS\n */\n\n.sidebar__items {\n    /* max-height: 1000px; */\n    /* transition: max-height 0.5;*/\n    background-color: #222;\n    padding-bottom: 20px;\n}\n\n.sidebar--closed .sidebar__items {\n    /* max-height: 0; */\n    height: 0;\n    display: none;\n    pointer-interactions: none;\n}\n\n.sidebar__item__right {\n    float: right;\n}\n\n/*\n * SIDEBAR GROUP\n */\n\n.sidebar__group {\n    /*background-color: #1A1A1A;*/\n    overflow: hidden;\n    box-sizing: border-box;\n    animate: height;\n    /*background-color: #151515;*/\n    /* max-height: 1000px; */\n    /* transition: max-height 0.5s; */\n--sidebar-group-header-height: 33px;\n}\n\n.sidebar__group-items\n{\n    padding-top: 15px;\n    padding-bottom: 15px;\n}\n\n.sidebar__group--closed {\n    /* max-height: 13px; */\n    height: var(--sidebar-group-header-height);\n}\n\n.sidebar__group-header {\n    box-sizing: border-box;\n    color: #EEEEEE;\n    background-color: #151515;\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n\n    /*height: 100%;//var(--sidebar-group-header-height);*/\n\n    padding-top: 7px;\n    text-transform: uppercase;\n    letter-spacing: 0.08em;\n    cursor: pointer;\n    /*transition: background-color var(--sidebar-hover-transition-time);*/\n    position: relative;\n}\n\n.sidebar__group-header:hover {\n  background-color: #111111;\n}\n\n.sidebar__group-header-title {\n  /*float: left;*/\n  overflow: hidden;\n  padding: 0 15px;\n  padding-top:5px;\n  padding-bottom:10px;\n  font-weight:bold;\n}\n\n.sidebar__group-header-undo {\n    float: right;\n    overflow: hidden;\n    padding-right: 15px;\n    padding-top:5px;\n    font-weight:bold;\n  }\n\n.sidebar__group-header-icon {\n    width: 17px;\n    height: 14px;\n    background-repeat: no-repeat;\n    display: inline-block;\n    position: absolute;\n    background-size: cover;\n\n    /* icon open */\n    /* feather icon: chevron up */\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tdXAiPjxwb2x5bGluZSBwb2ludHM9IjE4IDE1IDEyIDkgNiAxNSI+PC9wb2x5bGluZT48L3N2Zz4=);\n    top: 4px;\n    right: 5px;\n    opacity: 0.0;\n    transition: opacity 0.3;\n}\n\n.sidebar__group-header:hover .sidebar__group-header-icon {\n    opacity: 1.0;\n}\n\n/* icon closed */\n.sidebar__group--closed .sidebar__group-header-icon {\n    /* feather icon: chevron down */\n    background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tZG93biI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+);\n    top: 4px;\n    right: 5px;\n}\n\n/*\n * SIDEBAR ITEM\n */\n\n.sidebar__item\n{\n    box-sizing: border-box;\n    padding: 7px;\n    padding-left:15px;\n    padding-right:15px;\n\n    overflow: hidden;\n    position: relative;\n}\n\n.sidebar__item-label {\n    display: inline-block;\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n    width: calc(50% - 7px);\n    margin-right: 7px;\n    margin-top: 2px;\n    text-overflow: ellipsis;\n    /* overflow: hidden; */\n}\n\n.sidebar__item-value-label {\n    font-family: var(--sidebar-monospace-font-stack);\n    display: inline-block;\n    text-overflow: ellipsis;\n    overflow: hidden;\n    white-space: nowrap;\n    max-width: 60%;\n}\n\n.sidebar__item-value-label::selection {\n    background-color: var(--sidebar-color);\n    color: #EEEEEE;\n}\n\n.sidebar__item + .sidebar__item,\n.sidebar__item + .sidebar__group,\n.sidebar__group + .sidebar__item,\n.sidebar__group + .sidebar__group {\n    /*border-top: 1px solid #272727;*/\n}\n\n/*\n * SIDEBAR ITEM TOGGLE\n */\n\n/*.sidebar__toggle */\n.icon_toggle{\n    cursor: pointer;\n}\n\n.sidebar__toggle-input {\n    --sidebar-toggle-input-color: #CCCCCC;\n    --sidebar-toggle-input-color-hover: #EEEEEE;\n    --sidebar-toggle-input-border-size: 2px;\n    display: inline;\n    float: right;\n    box-sizing: border-box;\n    border-radius: 50%;\n    cursor: pointer;\n    --toggle-size: 11px;\n    margin-top: 2px;\n    background-color: transparent !important;\n    border: var(--sidebar-toggle-input-border-size) solid var(--sidebar-toggle-input-color);\n    width: var(--toggle-size);\n    height: var(--toggle-size);\n    transition: background-color var(--sidebar-hover-transition-time);\n    transition: border-color var(--sidebar-hover-transition-time);\n}\n.sidebar__toggle:hover .sidebar__toggle-input {\n    border-color: var(--sidebar-toggle-input-color-hover);\n}\n\n.sidebar__toggle .sidebar__item-value-label {\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n    max-width: calc(50% - 12px);\n}\n.sidebar__toggle-input::after { clear: both; }\n\n.sidebar__toggle--active .icon_toggle\n{\n\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE1cHgiIHdpZHRoPSIzMHB4IiBmaWxsPSIjMDZmNzhiIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iIzA2Zjc4YiIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCBjMTIuNjUsMCwyMy0xMC4zNSwyMy0yM2wwLDBjMC0xMi42NS0xMC4zNS0yMy0yMy0yM0gzMHogTTcwLDY3Yy05LjM4OSwwLTE3LTcuNjEtMTctMTdzNy42MTEtMTcsMTctMTdzMTcsNy42MSwxNywxNyAgICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PC9nPjwvZz48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMweiBNNzAsNjdjLTkuMzg5LDAtMTctNy42MS0xNy0xN3M3LjYxMS0xNywxNy0xN3MxNyw3LjYxLDE3LDE3ICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48cGF0aCBmaWxsPSIjMDZmNzhiIiBzdHJva2U9IiMwNmY3OGIiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNNyw1MGMwLDEyLjY1LDEwLjM1LDIzLDIzLDIzaDQwICAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMwQzE3LjM1LDI3LDcsMzcuMzUsNyw1MEw3LDUweiI+PC9wYXRoPjwvZz48Y2lyY2xlIGRpc3BsYXk9ImlubGluZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiMwNmY3OGIiIHN0cm9rZT0iIzA2Zjc4YiIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN4PSI3MCIgY3k9IjUwIiByPSIxNyI+PC9jaXJjbGU+PC9nPjxnIGRpc3BsYXk9Im5vbmUiPjxwYXRoIGRpc3BsYXk9ImlubGluZSIgZD0iTTcwLDI1SDMwQzE2LjIxNSwyNSw1LDM2LjIxNSw1LDUwczExLjIxNSwyNSwyNSwyNWg0MGMxMy43ODUsMCwyNS0xMS4yMTUsMjUtMjVTODMuNzg1LDI1LDcwLDI1eiBNNzAsNzEgICBIMzBDMTguNDIxLDcxLDksNjEuNTc5LDksNTBzOS40MjEtMjEsMjEtMjFoNDBjMTEuNTc5LDAsMjEsOS40MjEsMjEsMjFTODEuNTc5LDcxLDcwLDcxeiBNNzAsMzFjLTEwLjQ3NywwLTE5LDguNTIzLTE5LDE5ICAgczguNTIzLDE5LDE5LDE5czE5LTguNTIzLDE5LTE5UzgwLjQ3NywzMSw3MCwzMXogTTcwLDY1Yy04LjI3MSwwLTE1LTYuNzI5LTE1LTE1czYuNzI5LTE1LDE1LTE1czE1LDYuNzI5LDE1LDE1Uzc4LjI3MSw2NSw3MCw2NXoiPjwvcGF0aD48L2c+PC9zdmc+);\n    opacity: 1;\n    transform: rotate(0deg);\n}\n\n\n.icon_toggle\n{\n    float: right;\n    width:40px;\n    height:18px;\n    background-image: url(data:image/svg+xml;base64,PHN2ZyBoZWlnaHQ9IjE1cHgiIHdpZHRoPSIzMHB4IiBmaWxsPSIjYWFhYWFhIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB2ZXJzaW9uPSIxLjEiIHg9IjBweCIgeT0iMHB4IiB2aWV3Qm94PSIwIDAgMTAwIDEwMCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMTAwIDEwMCIgeG1sOnNwYWNlPSJwcmVzZXJ2ZSI+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZmlsbD0iI2FhYWFhYSIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCBjMTIuNjUsMCwyMy0xMC4zNSwyMy0yM2wwLDBjMC0xMi42NS0xMC4zNS0yMy0yMy0yM0gzMHogTTcwLDY3Yy05LjM4OSwwLTE3LTcuNjEtMTctMTdzNy42MTEtMTcsMTctMTdzMTcsNy42MSwxNywxNyAgICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PC9nPjwvZz48Zz48cGF0aCBmaWxsLXJ1bGU9ImV2ZW5vZGQiIGNsaXAtcnVsZT0iZXZlbm9kZCIgZD0iTTMwLDI3QzE3LjM1LDI3LDcsMzcuMzUsNyw1MGwwLDBjMCwxMi42NSwxMC4zNSwyMywyMywyM2g0MCAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMweiBNNzAsNjdjLTkuMzg5LDAtMTctNy42MS0xNy0xN3M3LjYxMS0xNywxNy0xN3MxNyw3LjYxLDE3LDE3ICAgUzc5LjM4OSw2Nyw3MCw2N3oiPjwvcGF0aD48L2c+PGcgZGlzcGxheT0ibm9uZSI+PGcgZGlzcGxheT0iaW5saW5lIj48cGF0aCBmaWxsPSIjYWFhYWFhIiBzdHJva2U9IiNhYWFhYWEiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLW1pdGVybGltaXQ9IjEwIiBkPSJNNyw1MGMwLDEyLjY1LDEwLjM1LDIzLDIzLDIzaDQwICAgIGMxMi42NSwwLDIzLTEwLjM1LDIzLTIzbDAsMGMwLTEyLjY1LTEwLjM1LTIzLTIzLTIzSDMwQzE3LjM1LDI3LDcsMzcuMzUsNyw1MEw3LDUweiI+PC9wYXRoPjwvZz48Y2lyY2xlIGRpc3BsYXk9ImlubGluZSIgZmlsbC1ydWxlPSJldmVub2RkIiBjbGlwLXJ1bGU9ImV2ZW5vZGQiIGZpbGw9IiNhYWFhYWEiIHN0cm9rZT0iI2FhYWFhYSIgc3Ryb2tlLXdpZHRoPSI0IiBzdHJva2UtbWl0ZXJsaW1pdD0iMTAiIGN4PSI3MCIgY3k9IjUwIiByPSIxNyI+PC9jaXJjbGU+PC9nPjxnIGRpc3BsYXk9Im5vbmUiPjxwYXRoIGRpc3BsYXk9ImlubGluZSIgZD0iTTcwLDI1SDMwQzE2LjIxNSwyNSw1LDM2LjIxNSw1LDUwczExLjIxNSwyNSwyNSwyNWg0MGMxMy43ODUsMCwyNS0xMS4yMTUsMjUtMjVTODMuNzg1LDI1LDcwLDI1eiBNNzAsNzEgICBIMzBDMTguNDIxLDcxLDksNjEuNTc5LDksNTBzOS40MjEtMjEsMjEtMjFoNDBjMTEuNTc5LDAsMjEsOS40MjEsMjEsMjFTODEuNTc5LDcxLDcwLDcxeiBNNzAsMzFjLTEwLjQ3NywwLTE5LDguNTIzLTE5LDE5ICAgczguNTIzLDE5LDE5LDE5czE5LTguNTIzLDE5LTE5UzgwLjQ3NywzMSw3MCwzMXogTTcwLDY1Yy04LjI3MSwwLTE1LTYuNzI5LTE1LTE1czYuNzI5LTE1LDE1LTE1czE1LDYuNzI5LDE1LDE1Uzc4LjI3MSw2NSw3MCw2NXoiPjwvcGF0aD48L2c+PC9zdmc+);\n    background-size: 50px 37px;\n    background-position: -6px -10px;\n    transform: rotate(180deg);\n    opacity: 0.4;\n}\n\n\n\n/*.sidebar__toggle--active .sidebar__toggle-input {*/\n/*    transition: background-color var(--sidebar-hover-transition-time);*/\n/*    background-color: var(--sidebar-toggle-input-color);*/\n/*}*/\n/*.sidebar__toggle--active .sidebar__toggle-input:hover*/\n/*{*/\n/*    background-color: var(--sidebar-toggle-input-color-hover);*/\n/*    border-color: var(--sidebar-toggle-input-color-hover);*/\n/*    transition: background-color var(--sidebar-hover-transition-time);*/\n/*    transition: border-color var(--sidebar-hover-transition-time);*/\n/*}*/\n\n/*\n * SIDEBAR ITEM BUTTON\n */\n\n.sidebar__button {}\n\n.sidebar__button-input {\n    -webkit-user-select: none;  /* Chrome all / Safari all */\n    -moz-user-select: none;     /* Firefox all */\n    -ms-user-select: none;      /* IE 10+ */\n    user-select: none;          /* Likely future */\n    min-height: 24px;\n    background-color: transparent;\n    color: #CCCCCC;\n    box-sizing: border-box;\n    padding-top: 3px;\n    text-align: center;\n    border-radius: 125px;\n    border:2px solid #555;\n    cursor: pointer;\n    padding-bottom: 3px;\n}\n\n.sidebar__button-input.plus, .sidebar__button-input.minus {\n    display: inline-block;\n    min-width: 20px;\n}\n\n.sidebar__button-input:hover {\n  background-color: #333;\n  border:2px solid var(--sidebar-color);\n}\n\n/*\n * VALUE DISPLAY (shows a value)\n */\n\n.sidebar__value-display {}\n\n/*\n * SLIDER\n */\n\n.sidebar__slider {\n    --sidebar-slider-input-height: 3px;\n}\n\n.sidebar__slider-input-wrapper {\n    width: 100%;\n\n    margin-top: 8px;\n    position: relative;\n}\n\n.sidebar__slider-input {\n    -webkit-appearance: none;\n    appearance: none;\n    margin: 0;\n    width: 100%;\n    height: var(--sidebar-slider-input-height);\n    background: #555;\n    cursor: pointer;\n    outline: 0;\n\n    -webkit-transition: .2s;\n    transition: background-color .2s;\n    border: none;\n}\n\n.sidebar__slider-input:focus, .sidebar__slider-input:hover {\n    border: none;\n}\n\n.sidebar__slider-input-active-track {\n    user-select: none;\n    position: absolute;\n    z-index: 11;\n    top: 0;\n    left: 0;\n    background-color: var(--sidebar-color);\n    pointer-events: none;\n    height: var(--sidebar-slider-input-height);\n    max-width: 100%;\n}\n\n/* Mouse-over effects */\n.sidebar__slider-input:hover {\n    /*background-color: #444444;*/\n}\n\n/*.sidebar__slider-input::-webkit-progress-value {*/\n/*    background-color: green;*/\n/*    color:green;*/\n\n/*    }*/\n\n/* The slider handle (use -webkit- (Chrome, Opera, Safari, Edge) and -moz- (Firefox) to override default look) */\n\n.sidebar__slider-input::-moz-range-thumb\n{\n    position: absolute;\n    height: 15px;\n    width: 15px;\n    z-index: 900 !important;\n    border-radius: 20px !important;\n    cursor: pointer;\n    background: var(--sidebar-color) !important;\n    user-select: none;\n\n}\n\n.sidebar__slider-input::-webkit-slider-thumb\n{\n    position: relative;\n    appearance: none;\n    -webkit-appearance: none;\n    user-select: none;\n    height: 15px;\n    width: 15px;\n    display: block;\n    z-index: 900 !important;\n    border: 0;\n    border-radius: 20px !important;\n    cursor: pointer;\n    background: #777 !important;\n}\n\n.sidebar__slider-input:hover ::-webkit-slider-thumb {\n    background-color: #EEEEEE !important;\n}\n\n/*.sidebar__slider-input::-moz-range-thumb {*/\n\n/*    width: 0 !important;*/\n/*    height: var(--sidebar-slider-input-height);*/\n/*    background: #EEEEEE;*/\n/*    cursor: pointer;*/\n/*    border-radius: 0 !important;*/\n/*    border: none;*/\n/*    outline: 0;*/\n/*    z-index: 100 !important;*/\n/*}*/\n\n.sidebar__slider-input::-moz-range-track {\n    background-color: transparent;\n    z-index: 11;\n}\n\n/*.sidebar__slider-input::-moz-range-thumb:hover {*/\n  /* background-color: #EEEEEE; */\n/*}*/\n\n\n/*.sidebar__slider-input-wrapper:hover .sidebar__slider-input-active-track {*/\n/*    background-color: #EEEEEE;*/\n/*}*/\n\n/*.sidebar__slider-input-wrapper:hover .sidebar__slider-input::-moz-range-thumb {*/\n/*    background-color: #fff !important;*/\n/*}*/\n\n/*.sidebar__slider-input-wrapper:hover .sidebar__slider-input::-webkit-slider-thumb {*/\n/*    background-color: #EEEEEE;*/\n/*}*/\n\n.sidebar__slider input[type=text],\n.sidebar__slider input[type=paddword]\n{\n    box-sizing: border-box;\n    /*background-color: #333333;*/\n    text-align: right;\n    color: #BBBBBB;\n    display: inline-block;\n    background-color: transparent !important;\n\n    width: 40%;\n    height: 18px;\n    outline: none;\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n}\n\n.sidebar__slider input[type=text]:active,\n.sidebar__slider input[type=text]:focus,\n.sidebar__slider input[type=text]:hover\n.sidebar__slider input[type=password]:active,\n.sidebar__slider input[type=password]:focus,\n.sidebar__slider input[type=password]:hover\n{\n\n    color: #EEEEEE;\n}\n\n/*\n * TEXT / DESCRIPTION\n */\n\n.sidebar__text .sidebar__item-label {\n    width: auto;\n    display: block;\n    max-height: none;\n    margin-right: 0;\n    line-height: 1.1em;\n}\n\n/*\n * SIDEBAR INPUT\n */\n.sidebar__text-input textarea,\n.sidebar__text-input input[type=text],\n.sidebar__text-input input[type=password] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: 50%;\n    height: 18px;\n    outline: none;\n    border: none;\n    border-radius: 0;\n    border:1px solid #666;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n}\n\n.sidebar__text-input textarea:focus::placeholder {\n  color: transparent;\n}\n\n.sidebar__color-picker .sidebar__item-label\n{\n    width:45%;\n}\n\n.sidebar__text-input textarea,\n.sidebar__text-input input[type=text]:active,\n.sidebar__text-input input[type=text]:focus,\n.sidebar__text-input input[type=text]:hover,\n.sidebar__text-input input[type=password]:active,\n.sidebar__text-input input[type=password]:focus,\n.sidebar__text-input input[type=password]:hover {\n    background-color: transparent;\n    color: #EEEEEE;\n}\n\n.sidebar__text-input textarea\n{\n    margin-top:10px;\n    height:60px;\n    width:100%;\n}\n\n/*\n * SIDEBAR SELECT\n */\n\n\n\n .sidebar__select {}\n .sidebar__select-select {\n    color: #BBBBBB;\n    /*-webkit-appearance: none;*/\n    /*-moz-appearance: none;*/\n    appearance: none;\n    /*box-sizing: border-box;*/\n    width: 50%;\n    /*height: 20px;*/\n    background-color: #333333;\n    /*background-image: url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiM4ODg4ODgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWNoZXZyb24tZG93biI+PHBvbHlsaW5lIHBvaW50cz0iNiA5IDEyIDE1IDE4IDkiPjwvcG9seWxpbmU+PC9zdmc+);*/\n    background-repeat: no-repeat;\n    background-position: right center;\n    background-size: 16px 16px;\n    margin: 0;\n    /*padding: 0 2 2 6px;*/\n    border-radius: 5px;\n    border: 1px solid #777;\n    background-color: #444;\n    cursor: pointer;\n    outline: none;\n    padding-left: 5px;\n\n }\n\n.sidebar__select-select:hover,\n.sidebar__select-select:active,\n.sidebar__select-select:active {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\n/*\n * COLOR PICKER\n */\n\n\n .sidebar__color-picker input[type=text] {\n    box-sizing: border-box;\n    background-color: #333333;\n    color: #BBBBBB;\n    display: inline-block;\n    width: calc(50% - 21px); /* 50% minus space of picker circle */\n    height: 18px;\n    outline: none;\n    border: none;\n    border-radius: 0;\n    padding: 0 0 0 4px !important;\n    margin: 0;\n    margin-right: 7px;\n}\n\n.sidebar__color-picker input[type=text]:active,\n.sidebar__color-picker input[type=text]:focus,\n.sidebar__color-picker input[type=text]:hover {\n    background-color: #444444;\n    color: #EEEEEE;\n}\n\ndiv.sidebar__color-picker-color-input,\n.sidebar__color-picker input[type=color],\n.sidebar__palette-picker input[type=color] {\n    display: inline-block;\n    border-radius: 100%;\n    height: 14px;\n    width: 14px;\n\n    padding: 0;\n    border: none;\n    /*border:2px solid red;*/\n    border-color: transparent;\n    outline: none;\n    background: none;\n    appearance: none;\n    -moz-appearance: none;\n    -webkit-appearance: none;\n    cursor: pointer;\n    position: relative;\n    top: 3px;\n}\n.sidebar__color-picker input[type=color]:focus,\n.sidebar__palette-picker input[type=color]:focus {\n    outline: none;\n}\n.sidebar__color-picker input[type=color]::-moz-color-swatch,\n.sidebar__palette-picker input[type=color]::-moz-color-swatch {\n    border: none;\n}\n.sidebar__color-picker input[type=color]::-webkit-color-swatch-wrapper,\n.sidebar__palette-picker input[type=color]::-webkit-color-swatch-wrapper {\n    padding: 0;\n}\n.sidebar__color-picker input[type=color]::-webkit-color-swatch,\n.sidebar__palette-picker input[type=color]::-webkit-color-swatch {\n    border: none;\n    border-radius: 100%;\n}\n\n/*\n * Palette Picker\n */\n.sidebar__palette-picker .sidebar__palette-picker-color-input.first {\n    margin-left: 0;\n}\n.sidebar__palette-picker .sidebar__palette-picker-color-input.last {\n    margin-right: 0;\n}\n.sidebar__palette-picker .sidebar__palette-picker-color-input {\n    margin: 0 4px;\n}\n\n.sidebar__palette-picker .circlebutton {\n    width: 14px;\n    height: 14px;\n    border-radius: 1em;\n    display: inline-block;\n    top: 3px;\n    position: relative;\n}\n\n/*\n * Preset\n */\n.sidebar__item-presets-preset\n{\n    padding:4px;\n    cursor:pointer;\n    padding-left:8px;\n    padding-right:8px;\n    margin-right:4px;\n    background-color:#444;\n}\n\n.sidebar__item-presets-preset:hover\n{\n    background-color:#666;\n}\n\n.sidebar__greyout\n{\n    background: #222;\n    opacity: 0.8;\n    width: 100%;\n    height: 100%;\n    position: absolute;\n    z-index: 1000;\n    right: 0;\n    top: 0;\n}\n\n.sidebar_tabs\n{\n    background-color: #151515;\n    padding-bottom: 0px;\n}\n\n.sidebar_switchs\n{\n    float: right;\n}\n\n.sidebar_tab\n{\n    float:left;\n    background-color: #151515;\n    border-bottom:1px solid transparent;\n    padding-right:7px;\n    padding-left:7px;\n    padding-bottom: 5px;\n    padding-top: 5px;\n    cursor:pointer;\n}\n\n.sidebar_tab_active\n{\n    background-color: #272727;\n    color:white;\n}\n\n.sidebar_tab:hover\n{\n    border-bottom:1px solid #777;\n    color:white;\n}\n\n\n.sidebar_switch\n{\n    float:left;\n    background-color: #444;\n    padding-right:7px;\n    padding-left:7px;\n    padding-bottom: 5px;\n    padding-top: 5px;\n    cursor:pointer;\n}\n\n.sidebar_switch:last-child\n{\n    border-top-right-radius: 7px;\n    border-bottom-right-radius: 7px;\n}\n\n.sidebar_switch:first-child\n{\n    border-top-left-radius: 7px;\n    border-bottom-left-radius: 7px;\n}\n\n\n.sidebar_switch_active\n{\n    background-color: #999;\n    color:white;\n}\n\n.sidebar_switch:hover\n{\n    color:white;\n}\n",};
// vars
const CSS_ELEMENT_CLASS = "cables-sidebar-style"; /* class for the style element to be generated */
const CSS_ELEMENT_DYNAMIC_CLASS = "cables-sidebar-dynamic-style"; /* things which can be set via op-port, but not attached to the elements themselves, e.g. minimized opacity */
const SIDEBAR_CLASS = "sidebar-cables";
const SIDEBAR_ID = "sidebar" + CABLES.uuid();
const SIDEBAR_ITEMS_CLASS = "sidebar__items";
const SIDEBAR_OPEN_CLOSE_BTN_CLASS = "sidebar__close-button";

const BTN_TEXT_OPEN = ""; // 'Close';
const BTN_TEXT_CLOSED = ""; // 'Show Controls';

let openCloseBtn = null;
let openCloseBtnIcon = null;
let headerTitleText = null;

// inputs
const visiblePort = op.inValueBool("Visible", true);
const opacityPort = op.inValueSlider("Opacity", 1);
const defaultMinimizedPort = op.inValueBool("Default Minimized");
const minimizedOpacityPort = op.inValueSlider("Minimized Opacity", 0.5);
const undoButtonPort = op.inValueBool("Show undo button", false);
const inMinimize = op.inValueBool("Show Minimize", false);

const inTitle = op.inString("Title", "Sidebar");
const side = op.inValueBool("Side");

// outputs
const childrenPort = op.outObject("childs");
childrenPort.setUiAttribs({ "title": "Children" });

const isOpenOut = op.outBool("Opfened");
isOpenOut.setUiAttribs({ "title": "Opened" });

let sidebarEl = document.querySelector("." + SIDEBAR_ID);
if (!sidebarEl)
{
    sidebarEl = initSidebarElement();
}
// if(!sidebarEl) return;
const sidebarItemsEl = sidebarEl.querySelector("." + SIDEBAR_ITEMS_CLASS);
childrenPort.set({
    "parentElement": sidebarItemsEl,
    "parentOp": op,
});
onDefaultMinimizedPortChanged();
initSidebarCss();
updateDynamicStyles();

// change listeners
visiblePort.onChange = onVisiblePortChange;
opacityPort.onChange = onOpacityPortChange;
defaultMinimizedPort.onChange = onDefaultMinimizedPortChanged;
minimizedOpacityPort.onChange = onMinimizedOpacityPortChanged;
undoButtonPort.onChange = onUndoButtonChange;
op.onDelete = onDelete;

// functions

function onMinimizedOpacityPortChanged()
{
    updateDynamicStyles();
}

inMinimize.onChange = updateMinimize;

function updateMinimize(header)
{
    if (!header || header.uiAttribs) header = document.querySelector(".sidebar-cables .sidebar__group-header");
    if (!header) return;

    const undoButton = document.querySelector(".sidebar-cables .sidebar__group-header .sidebar__group-header-undo");

    if (inMinimize.get())
    {
        header.classList.add("iconsidebar-chevron-up");
        header.classList.add("iconsidebar-minimizebutton");

        if (undoButton)undoButton.style.marginRight = "20px";
    }
    else
    {
        header.classList.remove("iconsidebar-chevron-up");
        header.classList.remove("iconsidebar-minimizebutton");

        if (undoButton)undoButton.style.marginRight = "initial";
    }
}

side.onChange = function ()
{
    if (side.get()) sidebarEl.classList.add("sidebar-cables-right");
    else sidebarEl.classList.remove("sidebar-cables-right");
};

function onUndoButtonChange()
{
    const header = document.querySelector(".sidebar-cables .sidebar__group-header");
    if (header)
    {
        initUndoButton(header);
    }
}

function initUndoButton(header)
{
    if (header)
    {
        const undoButton = document.querySelector(".sidebar-cables .sidebar__group-header .sidebar__group-header-undo");
        if (undoButton)
        {
            if (!undoButtonPort.get())
            {
                // header.removeChild(undoButton);
                undoButton.remove();
            }
        }
        else
        {
            if (undoButtonPort.get())
            {
                const headerUndo = document.createElement("span");
                headerUndo.classList.add("sidebar__group-header-undo");
                headerUndo.classList.add("sidebar-icon-undo");

                headerUndo.addEventListener("click", function (event)
                {
                    event.stopPropagation();
                    const reloadables = document.querySelectorAll(".sidebar-cables .sidebar__reloadable");
                    const doubleClickEvent = document.createEvent("MouseEvents");
                    doubleClickEvent.initEvent("dblclick", true, true);
                    reloadables.forEach((reloadable) =>
                    {
                        reloadable.dispatchEvent(doubleClickEvent);
                    });
                });
                header.appendChild(headerUndo);
            }
        }
    }
    updateMinimize(header);
}

function onDefaultMinimizedPortChanged()
{
    if (!openCloseBtn) { return; }
    if (defaultMinimizedPort.get())
    {
        sidebarEl.classList.add("sidebar--closed");
        if (visiblePort.get())
        {
            isOpenOut.set(false);
        }
        // openCloseBtn.textContent = BTN_TEXT_CLOSED;
    }
    else
    {
        sidebarEl.classList.remove("sidebar--closed");
        if (visiblePort.get())
        {
            isOpenOut.set(true);
        }
        // openCloseBtn.textContent = BTN_TEXT_OPEN;
    }
}

function onOpacityPortChange()
{
    const opacity = opacityPort.get();
    sidebarEl.style.opacity = opacity;
}

function onVisiblePortChange()
{
    if (visiblePort.get())
    {
        sidebarEl.style.display = "block";
        if (!sidebarEl.classList.contains("sidebar--closed"))
        {
            isOpenOut.set(true);
        }
    }
    else
    {
        sidebarEl.style.display = "none";
        isOpenOut.set(false);
    }
}

side.onChanged = function ()
{

};

/**
 * Some styles cannot be set directly inline, so a dynamic stylesheet is needed.
 * Here hover states can be set later on e.g.
 */
function updateDynamicStyles()
{
    const dynamicStyles = document.querySelectorAll("." + CSS_ELEMENT_DYNAMIC_CLASS);
    if (dynamicStyles)
    {
        dynamicStyles.forEach(function (e)
        {
            e.parentNode.removeChild(e);
        });
    }
    const newDynamicStyle = document.createElement("style");
    newDynamicStyle.classList.add(CSS_ELEMENT_DYNAMIC_CLASS);
    let cssText = ".sidebar--closed .sidebar__close-button { ";
    cssText += "opacity: " + minimizedOpacityPort.get();
    cssText += "}";
    const cssTextEl = document.createTextNode(cssText);
    newDynamicStyle.appendChild(cssTextEl);
    document.body.appendChild(newDynamicStyle);
}

function initSidebarElement()
{
    const element = document.createElement("div");
    element.classList.add(SIDEBAR_CLASS);
    element.classList.add(SIDEBAR_ID);
    const canvasWrapper = op.patch.cgl.canvas.parentElement; /* maybe this is bad outside cables!? */

    // header...
    const headerGroup = document.createElement("div");
    headerGroup.classList.add("sidebar__group");

    element.appendChild(headerGroup);
    const header = document.createElement("div");
    header.classList.add("sidebar__group-header");

    element.appendChild(header);
    const headerTitle = document.createElement("span");
    headerTitle.classList.add("sidebar__group-header-title");
    headerTitleText = document.createElement("span");
    headerTitleText.classList.add("sidebar__group-header-title-text");
    headerTitleText.innerHTML = inTitle.get();
    headerTitle.appendChild(headerTitleText);
    header.appendChild(headerTitle);

    initUndoButton(header);
    updateMinimize(header);

    headerGroup.appendChild(header);
    element.appendChild(headerGroup);
    headerGroup.addEventListener("click", onOpenCloseBtnClick);

    if (!canvasWrapper)
    {
        op.warn("[sidebar] no canvas parentelement found...");
        return;
    }
    canvasWrapper.appendChild(element);
    const items = document.createElement("div");
    items.classList.add(SIDEBAR_ITEMS_CLASS);
    element.appendChild(items);
    openCloseBtn = document.createElement("div");
    openCloseBtn.classList.add(SIDEBAR_OPEN_CLOSE_BTN_CLASS);
    openCloseBtn.addEventListener("click", onOpenCloseBtnClick);
    // openCloseBtn.textContent = BTN_TEXT_OPEN;
    element.appendChild(openCloseBtn);
    // openCloseBtnIcon = document.createElement("span");

    // openCloseBtnIcon.classList.add("sidebar__close-button-icon");
    // openCloseBtnIcon.classList.add("iconsidebar-chevron-up");

    // openCloseBtn.appendChild(openCloseBtnIcon);

    return element;
}

inTitle.onChange = function ()
{
    if (headerTitleText)headerTitleText.innerHTML = inTitle.get();
};

function setClosed(b)
{

}

function onOpenCloseBtnClick(ev)
{
    ev.stopPropagation();
    if (!sidebarEl) { op.logError("Sidebar could not be closed..."); return; }
    sidebarEl.classList.toggle("sidebar--closed");
    const btn = ev.target;
    let btnText = BTN_TEXT_OPEN;
    if (sidebarEl.classList.contains("sidebar--closed"))
    {
        btnText = BTN_TEXT_CLOSED;
        isOpenOut.set(false);
    }
    else
    {
        isOpenOut.set(true);
    }
}

function initSidebarCss()
{
    // var cssEl = document.getElementById(CSS_ELEMENT_ID);
    const cssElements = document.querySelectorAll("." + CSS_ELEMENT_CLASS);
    // remove old script tag
    if (cssElements)
    {
        cssElements.forEach(function (e)
        {
            e.parentNode.removeChild(e);
        });
    }
    const newStyle = document.createElement("style");
    newStyle.innerHTML = attachments.style_css;
    newStyle.classList.add(CSS_ELEMENT_CLASS);
    document.body.appendChild(newStyle);
}

function onDelete()
{
    removeElementFromDOM(sidebarEl);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild) el.parentNode.removeChild(el);
}


};

Ops.Sidebar.Sidebar.prototype = new CABLES.Op();
CABLES.OPS["5a681c35-78ce-4cb3-9858-bc79c34c6819"]={f:Ops.Sidebar.Sidebar,objName:"Ops.Sidebar.Sidebar"};




// **************************************************************
// 
// Ops.Ui.PatchInput
// 
// **************************************************************

Ops.Ui.PatchInput = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const dyn = op.addOutPort(new CABLES.Port(op, "create port", CABLES.OP_PORT_TYPE_DYNAMIC));

function getPatchOp()
{
    for (let i in op.patch.ops)
    {
        if (op.patch.ops[i].patchId)
        {
            if (op.patch.ops[i].patchId.get() == op.uiAttribs.subPatch)
            {
                return op.patch.ops[i];
            }
        }
    }
}

dyn.onLinkChanged = () =>
{
    const mySubPatchOp = getPatchOp();

    if (!dyn.links.length || !mySubPatchOp || !mySubPatchOp.addNewInPort) return;


    const otherPort = dyn.links[0].getOtherPort(dyn);
    dyn.removeLinks();

    const newPortName = mySubPatchOp.addNewInPort(otherPort);

    const l = gui.scene().link(
        otherPort.parent,
        otherPort.getName(),
        op,
        newPortName);

    mySubPatchOp.saveData();
};


};

Ops.Ui.PatchInput.prototype = new CABLES.Op();
CABLES.OPS["e3f68bc3-892a-4c78-9974-aca25c27025d"]={f:Ops.Ui.PatchInput,objName:"Ops.Ui.PatchInput"};




// **************************************************************
// 
// Ops.Ui.PatchOutput
// 
// **************************************************************

Ops.Ui.PatchOutput = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const dyn = op.addInPort(new CABLES.Port(op, "create port", CABLES.OP_PORT_TYPE_DYNAMIC));

function getPatchOp()
{
    for (let i in op.patch.ops)
    {
        if (op.patch.ops[i].patchId)
        {
            if (op.patch.ops[i].patchId.get() == op.uiAttribs.subPatch)
            {
                return op.patch.ops[i];
            }
        }
    }
}

dyn.onLinkChanged = () =>
{
    const mySubPatchOp = getPatchOp();

    if (!dyn.links.length) return;

    const otherPort = dyn.links[0].getOtherPort(dyn);
    dyn.removeLinks();

    const newPortName = mySubPatchOp.addNewOutPort(otherPort);

    const l = gui.scene().link(
        otherPort.parent,
        otherPort.getName(),
        op,
        newPortName);

    mySubPatchOp.saveData();
};


};

Ops.Ui.PatchOutput.prototype = new CABLES.Op();
CABLES.OPS["851b44cb-5667-4140-9800-5aeb7031f1d7"]={f:Ops.Ui.PatchOutput,objName:"Ops.Ui.PatchOutput"};




// **************************************************************
// 
// Ops.Ui.SubPatch
// 
// **************************************************************

Ops.Ui.SubPatch = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
op.dyn = op.addInPort(new CABLES.Port(op, "create port", CABLES.OP_PORT_TYPE_DYNAMIC));
op.dynOut = op.addOutPort(new CABLES.Port(op, "create port out", CABLES.OP_PORT_TYPE_DYNAMIC));

const dataStr = op.addInPort(new CABLES.Port(op, "dataStr", CABLES.OP_PORT_TYPE_VALUE, { "display": "readonly" }));
op.patchId = op.addInPort(new CABLES.Port(op, "patchId", CABLES.OP_PORT_TYPE_VALUE, { "display": "readonly" }));

if (CABLES.UI && CABLES.sandbox.isDevEnv())
{
    const inMakeBp = op.inTriggerButton("Create Blueprint");
    inMakeBp.setUiAttribs({ "hidePort": true });

    inMakeBp.onTriggered = makeBlueprint;
}

dataStr.setUiAttribs({ "hideParam": true });
op.patchId.setUiAttribs({ "hideParam": true });

let data = { "ports": [], "portsOut": [] };
let oldPatchId = CABLES.generateUUID();
op.patchId.set(oldPatchId);
getSubPatchInputOp();
getSubPatchOutputOp();

let dataLoaded = false;

op.saveData = saveData;

op.init = () =>
{
    op.setStorage({ "subPatchVer": 1 });
};

op.patchId.onChange = function ()
{
    const oldPatchOps = op.patch.getSubPatchOps(oldPatchId);
    if (oldPatchOps.length === 2)
    {
        if (op.patch.isEditorMode() && CABLES.UI.DEFAULTOPS.isInBlueprint(op)) CABLES.UI.undo.pause();
        for (let i = 0; i < oldPatchOps.length; i++)
        {
            op.patch.deleteOp(oldPatchOps[i].id);
        }
        if (op.patch.isEditorMode() && CABLES.UI.DEFAULTOPS.isInBlueprint(op)) CABLES.UI.undo.resume();
    }
};

op.onLoaded = function ()
{
};

op.onLoadedValueSet = function ()
{
    data = JSON.parse(dataStr.get());
    if (!data)
    {
        data = { "ports": [], "portsOut": [] };
    }
    setupPorts();
};

function loadData()
{
}

dataStr.onChange = function ()
{
    if (dataLoaded) return;

    if (!dataStr.get()) return;
    try
    {
        loadData();
    }
    catch (e)
    {
        op.logError("cannot load subpatch data...");
        op.logError(e);
    }
};

function saveData()
{
    try
    {
        dataStr.set(JSON.stringify(data));
    }
    catch (e)
    {
        op.log(e);
    }
}

op.addPortListener = addPortListener;
function addPortListener(newPort, newPortInPatch)
{
    if (!newPort.hasSubpatchLstener)
    {
        newPort.hasSubpatchLstener = true;
        newPort.addEventListener("onUiAttrChange", function (attribs)
        {
            if (attribs.title)
            {
                let i = 0;
                for (i = 0; i < data.portsOut.length; i++)
                    if (data.portsOut[i].name == newPort.name)
                        data.portsOut[i].title = attribs.title;

                for (i = 0; i < data.ports.length; i++)
                    if (data.ports[i].name == newPort.name)
                        data.ports[i].title = attribs.title;

                saveData();
            }
        });
    }

    if (newPort.direction == CABLES.PORT_DIR_IN)
    {
        if (newPort.type == CABLES.OP_PORT_TYPE_FUNCTION)
        {
            newPort.onTriggered = function ()
            {
                if (newPortInPatch.isLinked())
                    newPortInPatch.trigger();
            };
        }
        else
        {
            newPort.onChange = function ()
            {
                newPortInPatch.set(newPort.get());
                if (!newPort.isLinked())
                {
                    for (let i = 0; i < data.ports.length; i++)
                    {
                        if (data.ports[i].name === newPort.name)
                        {
                            data.ports[i].value = newPort.get();
                        }
                    }
                    saveData();
                }
            };
        }
    }
}

op.setupPorts = setupPorts;
function setupPorts()
{
    if (!op.patchId.get()) return;
    const ports = data.ports || [];
    const portsOut = data.portsOut || [];
    let i = 0;

    for (i = 0; i < ports.length; i++)
    {
        if (!op.getPortByName(ports[i].name))
        {
            const newPort = op.addInPort(new CABLES.Port(op, ports[i].name, ports[i].type));

            const patchInputOp = getSubPatchInputOp();
            const newPortInPatch = patchInputOp.addOutPort(new CABLES.Port(patchInputOp, ports[i].name, ports[i].type));

            newPort.ignoreValueSerialize = true;
            newPort.setUiAttribs({ "editableTitle": true });
            if (ports[i].title)
            {
                newPort.setUiAttribs({ "title": ports[i].title });
                newPortInPatch.setUiAttribs({ "title": ports[i].title });
            }
            if (ports[i].objType)
            {
                newPort.setUiAttribs({ "objType": ports[i].objType });
                newPortInPatch.setUiAttribs({ "objType": ports[i].objType });
            }
            if (ports[i].value)
            {
                newPort.set(ports[i].value);
                newPortInPatch.set(ports[i].value);
            }
            addPortListener(newPort, newPortInPatch);
        }
    }

    for (i = 0; i < portsOut.length; i++)
    {
        if (!op.getPortByName(portsOut[i].name))
        {
            const newPortOut = op.addOutPort(new CABLES.Port(op, portsOut[i].name, portsOut[i].type));
            const patchOutputOp = getSubPatchOutputOp();
            const newPortOutPatch = patchOutputOp.addInPort(new CABLES.Port(patchOutputOp, portsOut[i].name, portsOut[i].type));

            newPortOut.ignoreValueSerialize = true;
            newPortOut.setUiAttribs({ "editableTitle": true });

            if (portsOut[i].title)
            {
                newPortOut.setUiAttribs({ "title": portsOut[i].title });
                newPortOutPatch.setUiAttribs({ "title": portsOut[i].title });
            }
            if (portsOut[i].objType)
            {
                newPortOut.setUiAttribs({ "objType": portsOut[i].objType });
                newPortOutPatch.setUiAttribs({ "objType": portsOut[i].objType });
            }

            // addPortListener(newPortOut,newPortOutPatch);
            addPortListener(newPortOutPatch, newPortOut);
        }
    }

    dataLoaded = true;
}

op.addNewInPort = function (otherPort, type, objType)
{
    const newName = "in" + data.ports.length + " " + otherPort.parent.name + " " + otherPort.name;

    const o = { "name": newName, "type": otherPort.type };
    if (otherPort.uiAttribs.objType)o.objType = otherPort.uiAttribs.objType;

    data.ports.push(o);
    setupPorts();
    return newName;
};

op.dyn.onLinkChanged = function ()
{
    if (op.dyn.isLinked())
    {
        const otherPort = op.dyn.links[0].getOtherPort(op.dyn);
        op.dyn.removeLinks();
        otherPort.removeLinkTo(op.dyn);

        op.log("dyn link changed!!!");

        // const newName = "in" + data.ports.length + " " + otherPort.parent.name + " " + otherPort.name;

        // const o = { "name": newName, "type": otherPort.type };
        // if (otherPort.uiAttribs.objType)o.objType = otherPort.uiAttribs.objType;
        // data.ports.push(o);

        // setupPorts();

        const newName = op.addNewInPort(otherPort);

        const l = gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
        );

        dataLoaded = true;
        saveData();
    }
    else
    {
        setTimeout(function ()
        {
            op.dyn.removeLinks();
        }, 100);
    }
};

op.addNewOutPort = function (otherPort, type, objType)
{
    const newName = "out" + data.portsOut.length + " " + otherPort.parent.name + " " + otherPort.name;

    const o = { "name": newName, "type": otherPort.type };
    if (otherPort.uiAttribs.objType)o.objType = otherPort.uiAttribs.objType;

    data.portsOut.push(o);
    setupPorts();
    return newName;
};

op.dynOut.onLinkChanged = function ()
{
    if (op.dynOut.isLinked())
    {
        const otherPort = op.dynOut.links[0].getOtherPort(op.dynOut);
        op.dynOut.removeLinks();
        otherPort.removeLinkTo(op.dynOut);

        const newName = op.addNewOutPort(otherPort);

        gui.scene().link(
            otherPort.parent,
            otherPort.getName(),
            op,
            newName
        );

        dataLoaded = true;
        saveData();
    }
    else
    {
        setTimeout(function ()
        {
            op.dynOut.removeLinks();
        }, 100);

        op.log("dynOut unlinked...");
    }
};

function getSubPatchOutputOp()
{
    let patchOutputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchOutput");

    if (!patchOutputOP)
    {
        op.patch.addOp("Ops.Ui.PatchOutput", { "subPatch": op.patchId.get(), "translate": { "x": 0, "y": 0 } });
        patchOutputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchOutput");
        if (!patchOutputOP) op.warn("no patchoutput!");
    }
    return patchOutputOP;
}

function getSubPatchInputOp()
{
    let patchInputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchInput");

    if (!patchInputOP)
    {
        op.patch.addOp("Ops.Ui.PatchInput", { "subPatch": op.patchId.get(), "translate": { "x": 0, "y": 0 } });
        patchInputOP = op.patch.getSubPatchOp(op.patchId.get(), "Ops.Ui.PatchInput");
        if (!patchInputOP) op.warn("no patchinput2!");
    }

    return patchInputOP;
}

op.addSubLink = function (p, p2)
{
    const num = data.ports.length;
    const sublPortname = "in" + (num - 1) + " " + p2.parent.name + " " + p2.name;

    if (p.direction == CABLES.PORT_DIR_IN)
    {
        gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchInputOp(),
            sublPortname
        );
    }
    else
    {
        const numOut = data.portsOut.length;
        gui.scene().link(
            p.parent,
            p.getName(),
            getSubPatchOutputOp(),
            "out" + (numOut - 1) + " " + p2.parent.name + " " + p2.name
        );
    }

    const bounds = gui.patchView.getSubPatchBounds(op.patchId.get());

    getSubPatchInputOp().uiAttr(
        {
            "translate":
            {
                "x": bounds.minx,
                "y": bounds.miny - 100
            }
        });

    getSubPatchOutputOp().uiAttr(
        {
            "translate":
            {
                "x": bounds.minx,
                "y": bounds.maxy + 100
            }
        });
    saveData();
    return sublPortname;
};

op.onDelete = function ()
{
    for (let i = op.patch.ops.length - 1; i >= 0; i--)
    {
        if (op.patch.ops[i] && op.patch.ops[i].uiAttribs && op.patch.ops[i].uiAttribs.subPatch == op.patchId.get())
        {
            op.patch.deleteOp(op.patch.ops[i].id);
        }
    }
};

function makeBlueprint()
{
    let attribs = {
        "pasted": true,
        "translate": {
            "x": op.uiAttribs.translate.x - 150,
            "y": op.uiAttribs.translate.y
        }
    };

    if (CABLES.UI) attribs.subPatch = gui.patchView.getCurrentSubPatch();

    const bpOp = op.patch.addOp(CABLES.UI.DEFAULTOPNAMES.blueprint, attribs);
    bpOp.createBlueprint(gui.patchId, op.patchId.get(), true);
}

op.rebuildListeners = () =>
{
    op.log("rebuild listeners...");

    const outop = getSubPatchOutputOp();
    for (let i = 0; i < outop.portsIn.length; i++)
    {
        if (outop.portsIn[i].isLinked())
        {
            addPortListener(outop.portsIn[i], this.portsOut[i]);
        }
    }
};


};

Ops.Ui.SubPatch.prototype = new CABLES.Op();
CABLES.OPS["84d9a6f0-ed7a-466d-b386-225ed9e89c60"]={f:Ops.Ui.SubPatch,objName:"Ops.Ui.SubPatch"};




// **************************************************************
// 
// Ops.String.StringEquals
// 
// **************************************************************

Ops.String.StringEquals = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    str1 = op.inString("String 1"),
    str2 = op.inString("String 2"),
    result = op.outBoolNum("Result");

str1.onChange =
str2.onChange =
    function ()
    {
        result.set(str1.get() == str2.get());
    };


};

Ops.String.StringEquals.prototype = new CABLES.Op();
CABLES.OPS["ef15195a-760b-4ac5-9630-322b0ba7b722"]={f:Ops.String.StringEquals,objName:"Ops.String.StringEquals"};




// **************************************************************
// 
// Ops.Vars.VarSetObject_v2
// 
// **************************************************************

Ops.Vars.VarSetObject_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const val = op.inObject("Value", null);
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "object", val, op.varName);


};

Ops.Vars.VarSetObject_v2.prototype = new CABLES.Op();
CABLES.OPS["c7608375-5b45-4bca-87ef-d0c5e970779a"]={f:Ops.Vars.VarSetObject_v2,objName:"Ops.Vars.VarSetObject_v2"};




// **************************************************************
// 
// Ops.Vars.VarGetObject_v2
// 
// **************************************************************

Ops.Vars.VarGetObject_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const val = op.outObject("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "object", op.varName, val);


};

Ops.Vars.VarGetObject_v2.prototype = new CABLES.Op();
CABLES.OPS["321419d9-69c7-4310-a327-93d310bc2b8e"]={f:Ops.Vars.VarGetObject_v2,objName:"Ops.Vars.VarGetObject_v2"};




// **************************************************************
// 
// Ops.Cables.CustomOp_v2
// 
// **************************************************************

Ops.Cables.CustomOp_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const defaultCode = "\
// you can use custom javascript code here, it will be bound to the\n\
// scope of the current op, which is available as `op`.\n\
// \n\
// have a look at the documentation at:\n\
// https://docs.cables.gl/dev_hello_op/dev_hello_op.html\n\
\n\
";

const inJS = op.inStringEditor("JavaScript");
inJS.setUiAttribs({ "editorSyntax": "js" });
inJS.set(defaultCode);
const inLib = op.inUrl("Library", [".js"]);

const portsData = op.inString("portsData", "{}");
portsData.setUiAttribs({ "hidePort": true });
portsData.setUiAttribs({ "hideParam": true });
const protectedPorts = [inJS.id, inLib.id, portsData.id];

let wasPasted = false;

op.setUiError("error", null);

const init = function ()
{
    if (op.uiAttribs)
    {
        wasPasted = op.uiAttribs.pasted;
    }
    restorePorts();
    loadLibAndExecute();
    inLib.onChange = inJS.onChange = loadLibAndExecute;
    if (wasPasted) wasPasted = false;
};

op.onLoadedValueSet = init;
op.patch.on("onOpAdd", (newOp, fromDeserizalize) =>
{
    if (op == newOp && !fromDeserizalize)
    {
        init();
    }
});

op.onError = function (ex)
{
    if (op.patch.isEditorMode())
    {
        op.setUiError("error", ex);
        const str = inJS.get();
        const badLines = [];
        let htmlWarning = "";
        const lines = str.match(/^.*((\r\n|\n|\r)|$)/gm);

        let anonLine = "";
        const exLines = ex.stack.split("\n");
        for (let i = 0; i < exLines.length; i++)
        {
            // firefox
            if (exLines[i].includes("Function:"))
            {
                anonLine = exLines[i];
                break;
            }
            // chrome
            if (exLines[i].includes("anonymous"))
            {
                anonLine = exLines[i];
                break;
            }
        }

        let lineFields = anonLine.split(":");
        let errorLine = lineFields[lineFields.length - 2];

        badLines.push(errorLine - 2);

        for (const i in lines)
        {
            const j = parseInt(i, 10) + 1;
            const line = j + ": " + lines[i];

            let isBadLine = false;
            for (const bj in badLines)
                if (badLines[bj] == j) isBadLine = true;

            if (isBadLine) htmlWarning += "<span class=\"error\">";
            htmlWarning += line.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\"", "&quot;")
                .replaceAll("'", "&#039;");
            if (isBadLine) htmlWarning += "</span>";
        }

        ex.customMessage = htmlWarning;
        ex.stack = "";
        op.patch.emitEvent("exceptionOp", ex, op.name);
    }
};

const getEvalFunction = () =>
{
    op.setUiError("error", null);
    let errorEl = document.getElementById("customop-error-" + op.id);
    if (errorEl)
    {
        errorEl.remove();
    }
    try
    {
        return new Function("op", inJS.get());
    }
    catch (err)
    {
        op.onError(err);
        if (op.patch.isEditorMode())
        {
            errorEl = document.createElement("script");
            errorEl.id = "customop-error-" + op.id;
            errorEl.type = "text/javascript";
            errorEl.innerHTML = inJS.get();
            document.body.appendChild(errorEl);
        }
        else
        {
            op.logError("error creating javascript function", err);
        }
        return null;
    }
};

function loadLibAndExecute()
{
    if (inLib.get())
    {
        let scriptTag = document.getElementById("customop_lib_" + op.id);
        if (scriptTag)
        {
            scriptTag.remove();
        }
        scriptTag = document.createElement("script");
        scriptTag.id = "customlib_" + op.id;
        scriptTag.type = "text/javascript";
        scriptTag.src = op.patch.getFilePath(String(inLib.get()));
        scriptTag.onload = function ()
        {
            op.logVerbose("done loading library", inLib.get());
            execute();
        };
        document.body.appendChild(scriptTag);
    }
    else if (inJS.get() && inJS.get() !== defaultCode)
    {
        execute();
    }
}

const removeInPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsIn.length; ipi++)
    {
        if (op.portsIn[ipi] == port)
        {
            op.portsIn.splice(ipi, 1);
            return;
        }
    }
};

const removeOutPort = (port) =>
{
    port.removeLinks();
    for (let ipi = 0; ipi < op.portsOut.length; ipi++)
    {
        if (op.portsOut[ipi] == port)
        {
            op.portsOut.splice(ipi, 1);
            return;
        }
    }
};

const execute = () =>
{
    const evalFunction = getEvalFunction();
    if (evalFunction)
    {
        try
        {
            const oldLinksIn = {};
            const oldValuesIn = {};
            const oldLinksOut = {};
            const removeInPorts = [];
            const removeOutPorts = [];
            op.portsIn.forEach((port) =>
            {
                if (!protectedPorts.includes(port.id))
                {
                    oldLinksIn[port.name] = [];
                    oldValuesIn[port.name] = port.get();
                    port.links.forEach((link) =>
                    {
                        const linkInfo = {
                            "op": link.portOut.parent,
                            "portName": link.portOut.name
                        };
                        oldLinksIn[port.name].push(linkInfo);
                    });
                    removeInPorts.push(port);
                }
            });
            op.portsOut.forEach((port) =>
            {
                oldLinksOut[port.name] = [];
                port.links.forEach((link) =>
                {
                    const linkInfo = {
                        "op": link.portIn.parent,
                        "portName": link.portIn.name
                    };
                    oldLinksOut[port.name].push(linkInfo);
                });
                removeOutPorts.push(port);
            });
            removeInPorts.forEach((port) =>
            {
                removeInPort(port);
            });
            removeOutPorts.forEach((port) =>
            {
                removeOutPort(port);
            });
            if (removeOutPorts.length > 0 || removeInPorts.length > 0)
            {
                this.emitEvent("onUiAttribsChange", {});
                this.emitEvent("onPortRemoved", {});
            }
            evalFunction(this);

            op.portsIn.forEach((port) =>
            {
                if (!protectedPorts.includes(port.id))
                {
                    port.onLinkChanged = savePortData;

                    if (oldLinksIn[port.name])
                    {
                        oldLinksIn[port.name].forEach((link) =>
                        {
                            op.patch.link(op, port.name, link.op, link.portName);
                        });
                    }

                    if (typeof port.onChange == "function")
                    {
                        const oldHandler = port.onChange;
                        port.onChange = (p, v) =>
                        {
                            if (!port.isLinked()) savePortData();
                            oldHandler(p, v);
                        };
                    }
                    else
                    {
                        port.onChange = () =>
                        {
                            if (!port.isLinked()) savePortData();
                        };
                    }

                    // for backwards compatibility, do not add default handler (handled above)
                    if (typeof port.onValueChanged == "function")
                    {
                        const oldValueHandler = port.onValueChanged;
                        port.onValueChanged = (p, v) =>
                        {
                            if (!port.isLinked()) savePortData();
                            oldValueHandler(p, v);
                        };
                    }

                    if (oldValuesIn[port.name])
                    {
                        port.set(oldValuesIn[port.name]);
                    }
                }
            });
            op.portsOut.forEach((port) =>
            {
                port.onLinkChanged = savePortData;

                if (oldLinksOut[port.name])
                {
                    oldLinksOut[port.name].forEach((link) =>
                    {
                        op.patch.link(op, port.name, link.op, link.portName);
                    });
                }
            });
            if (wasPasted)
            {
                wasPasted = false;
            }
            savePortData();
        }
        catch (e)
        {
            if (op.patch.isEditorMode())
            {
                op.onError(e);
                const name = "Ops.Custom.CUSTOM" + op.id.replace(/-/g, "");
                const code = inJS.get();
                let codeHead = "Ops.Custom = Ops.Custom || {};\n";
                codeHead += name + " = " + name + " || {};\n";
                codeHead += name + " = function()\n{\nCABLES.Op.apply(this,arguments);\nconst op=this;\n";
                let codeFoot = "\n\n};\n\n" + name + ".prototype = new CABLES.Op();\n";
                codeFoot += "new " + name + "();\n";
                const opCode = codeHead + code + codeFoot;
                const errorEl = document.createElement("script");
                errorEl.id = "customop-error-" + op.id;
                errorEl.type = "text/javascript";
                errorEl.innerHTML = opCode;
                document.body.appendChild(errorEl);
            }
            else
            {
                op.logError("error executing javascript code", e);
            }
        }
    }
};

function savePortData()
{
    const newPortsData = { "portsIn": {}, "portsOut": {} };
    op.portsIn.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            let v = port.get();
            if (port.ignoreValueSerialize)v = null;
            const portData = {
                "name": port.name,
                "title": port.title,
                "value": v,
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                const linkData = {
                    "objOut": link.portOut.parent.id,
                    "portOut": link.portOut.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsIn[port.name] = portData;
        }
    });

    op.portsOut.forEach((port) =>
    {
        if (!protectedPorts.includes(port.id))
        {
            let v = port.get();
            if (port.ignoreValueSerialize)v = null;

            const portData = {
                "name": port.name,
                "title": port.title,
                "value": v,
                "type": port.type,
                "links": []
            };
            port.links.forEach((link) =>
            {
                const linkData = {
                    "objIn": link.portIn.parent.id,
                    "portIn": link.portIn.name
                };
                portData.links.push(linkData);
            });
            newPortsData.portsOut[port.name] = portData;
        }
    });

    let serializedPortsData = "{}";
    try
    {
        serializedPortsData = JSON.stringify(newPortsData);
    }
    catch (e)
    {
        op.log("failed to stringify new port data", newPortsData);
    }
    portsData.set(serializedPortsData);
}

const getOldPorts = () =>
{
    const jsonData = portsData.get();
    let oldPorts = {};
    try
    {
        oldPorts = JSON.parse(jsonData);
    }
    catch (e)
    {
        op.log("failed to parse old port data", jsonData);
    }

    let oldPortsIn = {};
    let oldPortsOut = {};

    if (oldPorts.portsOut)
    {
        oldPortsOut = oldPorts.portsOut;
    }
    if (oldPorts.portsIn)
    {
        oldPortsIn = oldPorts.portsIn;
    }
    return { "portsIn": oldPortsIn, "portsOut": oldPortsOut };
};

const restorePorts = () =>
{
    const oldPorts = getOldPorts();
    const portInKeys = Object.keys(oldPorts.portsIn);
    if (op.patch.isEditorMode()) CABLES.UI.undo.pause();
    for (let i = 0; i < portInKeys.length; i++)
    {
        const oldPortIn = oldPorts.portsIn[portInKeys[i]];
        const newPort = op.addInPort(new CABLES.Port(op, oldPortIn.name, oldPortIn.type));

        if (!wasPasted && Array.isArray(oldPortIn.links))
        {
            oldPortIn.links.forEach((link) =>
            {
                let parent = op.patch.getOpById(link.objOut);
                if (parent)
                {
                    op.patch.link(parent, link.portOut, op, newPort.name);
                }
            });
        }
        if (!newPort.isLinked())
        {
            newPort.set(oldPortIn.value);
        }
        newPort.onLinkChanged = savePortData;

        if (oldPortIn.title)
        {
            newPort.setUiAttribs({ "title": oldPortIn.title });
        }
    }

    const portOutKeys = Object.keys(oldPorts.portsOut);
    for (let i = 0; i < portOutKeys.length; i++)
    {
        const oldPortOut = oldPorts.portsOut[portOutKeys[i]];
        const newPort = op.addOutPort(new CABLES.Port(op, oldPortOut.name, oldPortOut.type));
        if (!wasPasted && Array.isArray(oldPortOut.links))
        {
            oldPortOut.links.forEach((link) =>
            {
                let parent = op.patch.getOpById(link.objIn);
                if (parent)
                {
                    op.patch.link(op, newPort.name, parent, link.portIn);
                }
            });
            if (!newPort.isLinked())
            {
                newPort.set(oldPortOut.value);
            }
            newPort.onLinkChanged = savePortData;

            if (oldPortOut.title)
            {
                newPort.setUiAttribs({ "title": oldPortOut.title });
            }
        }
    }
    if (op.patch.isEditorMode()) CABLES.UI.undo.resume();
};


};

Ops.Cables.CustomOp_v2.prototype = new CABLES.Op();
CABLES.OPS["19166505-2619-4012-ad85-d2de60f27274"]={f:Ops.Cables.CustomOp_v2,objName:"Ops.Cables.CustomOp_v2"};




// **************************************************************
// 
// Ops.Vars.VarGetString
// 
// **************************************************************

Ops.Vars.VarGetString = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var val=op.outString("Value");
op.varName=op.inValueSelect("Variable",[],"",true);

new CABLES.VarGetOpWrapper(op,"string",op.varName,val);


};

Ops.Vars.VarGetString.prototype = new CABLES.Op();
CABLES.OPS["3ad08cfc-bce6-4175-9746-fef2817a3b12"]={f:Ops.Vars.VarGetString,objName:"Ops.Vars.VarGetString"};




// **************************************************************
// 
// Ops.String.ArrayContainsString
// 
// **************************************************************

Ops.String.ArrayContainsString = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inArr = op.inArray("Array"),
    inValue = op.inString("SearchValue"),
    outFound = op.outBoolNum("Found", false),
    outIndex = op.outNumber("Index", -1);

inValue.onChange = () =>
{
    if (!inValue.isLinked()) op.setUiAttrib({ "extendTitle": inValue.get() });
    exec();
};

inArr.onChange = exec;

function exec()
{
    if (inArr.get())
    {
        const index = inArr.get().indexOf(inValue.get());

        outIndex.set(index);
        outFound.set(index > -1);
    }
}


};

Ops.String.ArrayContainsString.prototype = new CABLES.Op();
CABLES.OPS["bace9c9b-5e96-4a82-9bcd-02e316afb9de"]={f:Ops.String.ArrayContainsString,objName:"Ops.String.ArrayContainsString"};




// **************************************************************
// 
// Ops.Vars.VarSetNumber_v2
// 
// **************************************************************

Ops.Vars.VarSetNumber_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const val = op.inValueFloat("Value", 0);
op.varName = op.inDropDown("Variable", [], "", true);

new CABLES.VarSetOpWrapper(op, "number", val, op.varName);


};

Ops.Vars.VarSetNumber_v2.prototype = new CABLES.Op();
CABLES.OPS["b5249226-6095-4828-8a1c-080654e192fa"]={f:Ops.Vars.VarSetNumber_v2,objName:"Ops.Vars.VarSetNumber_v2"};




// **************************************************************
// 
// Ops.Trigger.GateTrigger
// 
// **************************************************************

Ops.Trigger.GateTrigger = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe = op.inTrigger('Execute'),
    passThrough = op.inValueBool('Pass Through',true),
    triggerOut = op.outTrigger('Trigger out');

exe.onTriggered = function()
{
    if(passThrough.get())
        triggerOut.trigger();
}


};

Ops.Trigger.GateTrigger.prototype = new CABLES.Op();
CABLES.OPS["65e8b8a2-ba13-485f-883a-2bcf377989da"]={f:Ops.Trigger.GateTrigger,objName:"Ops.Trigger.GateTrigger"};




// **************************************************************
// 
// Ops.Json.ParseObject_v2
// 
// **************************************************************

Ops.Json.ParseObject_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    str = op.inStringEditor("JSON String", "{}", "json"),
    outObj = op.outObject("Result"),
    isValid = op.outBoolNum("Valid");

str.onChange = parse;
parse();

function parse()
{
    if (!str.get())
    {
        outObj.set(null);
        isValid.set(false);
        return;
    }
    try
    {
        const obj = JSON.parse(str.get());
        outObj.setRef(obj);
        isValid.set(true);
        op.setUiError("invalidjson", null);
    }
    catch (ex)
    {
        op.logError(ex);
        isValid.set(false);

        let outStr = "";
        const parts = ex.message.split(" ");
        for (let i = 0; i < parts.length - 1; i++)
        {
            const num = parseFloat(parts[i + 1]);
            if (num && parts[i] == "position")
            {
                const outStrA = str.get().substring(num - 15, num);
                const outStrB = str.get().substring(num, num + 1);
                const outStrC = str.get().substring(num + 1, num + 15);
                outStr = "<span style=\"font-family:monospace;background-color:black;\">" + outStrA + "<span style=\"font-weight:bold;background-color:red;\">" + outStrB + "</span>" + outStrC + " </span>";
            }
        }

        op.setUiError("invalidjson", "INVALID JSON<br/>can not parse string to object:<br/><b> " + ex.message + "</b><br/>" + outStr);
    }
}


};

Ops.Json.ParseObject_v2.prototype = new CABLES.Op();
CABLES.OPS["2ce8a4d3-37d3-4cdc-abd1-a560fbe841ee"]={f:Ops.Json.ParseObject_v2,objName:"Ops.Json.ParseObject_v2"};




// **************************************************************
// 
// Ops.Json.ObjectGetObjectByPath
// 
// **************************************************************

Ops.Json.ObjectGetObjectByPath = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const resultOut = op.outObject("Output");
const foundOut = op.outBool("Found");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            let result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 2);
            }
            else if (Array.isArray(result) || result === null || typeof result !== "object")
            {
                const errorMsg = "element at path " + path + " is not an object";
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 2);
            }
            else
            {
                foundOut.set(true);
            }
            resultOut.setRef(result);
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => { return prev && prev[curr]; }, obj);
}


};

Ops.Json.ObjectGetObjectByPath.prototype = new CABLES.Op();
CABLES.OPS["574513c7-472b-433c-bf99-d906d3c737cd"]={f:Ops.Json.ObjectGetObjectByPath,objName:"Ops.Json.ObjectGetObjectByPath"};




// **************************************************************
// 
// Ops.Ui.Area
// 
// **************************************************************

Ops.Ui.Area = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const inTitle = op.inString("Title", "");

inTitle.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "hasArea": true });

// exe.onTriggered=function()
// {
//     op.patch.instancing.pushLoop(inNum.get());

//     for(let i=0;i<inNum.get();i++)
//     {
//         idx.set(i);
//         trigger.trigger();
//         op.patch.instancing.increment();
//     }

//     op.patch.instancing.popLoop();
// };

op.init =
    inTitle.onChange =
    op.onLoaded = update;

update();

function update()
{
    if (CABLES.UI)
    {
        gui.setStateUnsaved({ "op": op });
        op.uiAttr(
            {
                "comment_title": inTitle.get() || " "
            });

        op.name = inTitle.get();
    }
}


};

Ops.Ui.Area.prototype = new CABLES.Op();
CABLES.OPS["38f79614-b0de-4960-8da5-2827e7f43415"]={f:Ops.Ui.Area,objName:"Ops.Ui.Area"};




// **************************************************************
// 
// Ops.Ui.VizObject
// 
// **************************************************************

Ops.Ui.VizObject = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inObj = op.inObject("Object"),
    inConsole = op.inTriggerButton("console log"),
    inZoomText = op.inBool("ZoomText", false),
    inLineNums = op.inBool("Line Numbers", true),
    inFontSize = op.inFloat("Font Size", 10),
    inPos = op.inFloatSlider("Scroll", 0);

let lines = [];
inConsole.setUiAttribs({ "hidePort": true });

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

inObj.onChange = () =>
{
    let obj = inObj.get();
    let str = "???";

    if (obj && obj.getInfo)
    {
        obj = obj.getInfo();
    }

    if (obj instanceof Element)
    {
        const o = {};

        o.id = obj.getAttribute("id");
        o.classes = obj.classList.value;
        o.innerText = obj.innerText;
        o.tagName = obj.tagName;

        obj = o;
    }

    if (obj && obj.constructor && obj.constructor.name != "Object")
    {
        // str =  + "()\n" + str;
        op.setUiAttribs({ "extendTitle": obj.constructor.name });
    }

    try
    {
        str = JSON.stringify(obj, false, 4);

        if (str == "{}" && obj && obj.constructor && obj.constructor.name != "Object")
        {
            str = "could not stringify object: " + obj.constructor.name + "\n";

            if (obj) for (let i in obj)
            {
                str += "\n" + i + " (" + typeof obj[i] + ")";
            }
        }
    }
    catch (e)
    {
        str = "object can not be displayed as string";
    }

    if (str === undefined)str = "undefined";
    if (str === null)str = "null";
    str = String(str);
    lines = str.split("\n");
};

inObj.onLinkChanged = () =>
{
    if (inObj.isLinked())
    {
        const p = inObj.links[0].getOtherPort(inObj);

        op.setUiAttrib({ "extendTitle": p.uiAttribs.objType });
    }
};

inConsole.onTriggered = () =>
{
    console.log(inObj.get());
};

op.renderVizLayer = (ctx, layer, viz) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    // ctx.font = "normal 10px sourceCodePro";
    // ctx.fillStyle = "#ccc";
    // const padding = 10;

    viz.renderText(ctx, layer, lines, {
        "zoomText": inZoomText.get(),
        "showLineNum": inLineNums.get(),
        "fontSize": inFontSize.get(),
        "scroll": inPos.get()
    });

    ctx.restore();
};

//


};

Ops.Ui.VizObject.prototype = new CABLES.Op();
CABLES.OPS["d09bc53e-9f52-4872-94c7-4ef777512222"]={f:Ops.Ui.VizObject,objName:"Ops.Ui.VizObject"};




// **************************************************************
// 
// Ops.Vars.VarSetString_v2
// 
// **************************************************************

Ops.Vars.VarSetString_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const val=op.inString("Value","New String");
op.varName=op.inDropDown("Variable",[],"",true);

new CABLES.VarSetOpWrapper(op,"string",val,op.varName);




};

Ops.Vars.VarSetString_v2.prototype = new CABLES.Op();
CABLES.OPS["0b4d9229-8024-4a30-9cc0-f6653942c2e4"]={f:Ops.Vars.VarSetString_v2,objName:"Ops.Vars.VarSetString_v2"};




// **************************************************************
// 
// Ops.Trigger.TriggerCounter
// 
// **************************************************************

Ops.Trigger.TriggerCounter = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe = op.inTriggerButton("exe"),
    reset = op.inTriggerButton("reset"),
    trigger = op.outTrigger("trigger"),
    num = op.outNumber("timesTriggered");

op.toWorkPortsNeedToBeLinked(exe);

let n = 0;

reset.onTriggered =
op.onLoaded =
    doReset;

exe.onTriggered = function ()
{
    n++;
    num.set(n);
    op.setUiAttrib({ "extendTitle": n });
    trigger.trigger();
};

function doReset()
{
    n = 0;
    op.setUiAttrib({ "extendTitle": n });
    num.set(n);
}


};

Ops.Trigger.TriggerCounter.prototype = new CABLES.Op();
CABLES.OPS["e640619f-235c-4543-bbf8-b358e0283180"]={f:Ops.Trigger.TriggerCounter,objName:"Ops.Trigger.TriggerCounter"};




// **************************************************************
// 
// Ops.Json.ObjectStringify_v2
// 
// **************************************************************

Ops.Json.ObjectStringify_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inObj = op.inObject("Object"),
    inBeautify = op.inValueBool("Beautify", true),
    outString = op.outString("Result"),
    outError = op.outBoolNum("Error");

inBeautify.onChange = inObj.onChange = update;

function update()
{
    try
    {
        if (!inBeautify.get())outString.set(JSON.stringify(inObj.get()));
        else outString.set(JSON.stringify(inObj.get(), false, 4));
        outError.set(0);
    }
    catch (e)
    {
        op.error(e);
        outString.set("error");
        outError.set(1);
    }
}


};

Ops.Json.ObjectStringify_v2.prototype = new CABLES.Op();
CABLES.OPS["89fc70ea-2350-4a0e-9a24-4efca10cced6"]={f:Ops.Json.ObjectStringify_v2,objName:"Ops.Json.ObjectStringify_v2"};




// **************************************************************
// 
// Ops.Json.ObjectGetStringByPath
// 
// **************************************************************

Ops.Json.ObjectGetStringByPath = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const returnPathIn = op.inBool("Output path if missing", false);
const resultOut = op.outString("Output");
const foundOut = op.outBool("Found");

objectIn.ignoreValueSerialize = true;

objectIn.onChange = update;
pathIn.onChange = update;
returnPathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            let result = data[path];
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            if (!result) result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                let errorLevel = 2;
                result = null;
                foundOut.set(false);
                if (returnPathIn.get())
                {
                    result = path;
                    errorLevel = 1;
                }
                else
                {
                    result = null;
                }
                op.setUiError("missing", errorMsg, errorLevel);
            }
            else
            {
                foundOut.set(true);
                result = String(result);
            }
            resultOut.set(result);
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => { return prev && prev[curr]; }, obj);
}


};

Ops.Json.ObjectGetStringByPath.prototype = new CABLES.Op();
CABLES.OPS["497a6b7c-e33c-45e4-8fb2-a9149d972b5b"]={f:Ops.Json.ObjectGetStringByPath,objName:"Ops.Json.ObjectGetStringByPath"};




// **************************************************************
// 
// Ops.Trigger.TriggerOnChangeObject
// 
// **************************************************************

Ops.Trigger.TriggerOnChangeObject = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inval = op.inObject("Object"),
    next = op.outTrigger("Changed"),
    outArr = op.outObject("Result");

inval.onChange = function ()
{
    outArr.setRef(inval.get());
    next.trigger();
};


};

Ops.Trigger.TriggerOnChangeObject.prototype = new CABLES.Op();
CABLES.OPS["c7e3fa27-21e8-44ef-b176-e0e596837abb"]={f:Ops.Trigger.TriggerOnChangeObject,objName:"Ops.Trigger.TriggerOnChangeObject"};




// **************************************************************
// 
// Ops.Trigger.TriggerReceive
// 
// **************************************************************

Ops.Trigger.TriggerReceive = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const next = op.outTrigger("Triggered");
op.varName = op.inValueSelect("Named Trigger", [], "", true);

updateVarNamesDropdown();
op.patch.addEventListener("namedTriggersChanged", updateVarNamesDropdown);

let oldName = null;

function doTrigger()
{
    next.trigger();
}

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        let varnames = [];
        let vars = op.patch.namedTriggers;
        // varnames.push('+ create new one');
        for (let i in vars) varnames.push(i);
        op.varName.uiAttribs.values = varnames;
    }
}

op.varName.onChange = function ()
{
    if (oldName)
    {
        let oldCbs = op.patch.namedTriggers[oldName];
        let a = oldCbs.indexOf(doTrigger);
        if (a != -1) oldCbs.splice(a, 1);
    }

    op.setTitle(">" + op.varName.get());
    op.patch.namedTriggers[op.varName.get()] = op.patch.namedTriggers[op.varName.get()] || [];
    let cbs = op.patch.namedTriggers[op.varName.get()];

    cbs.push(doTrigger);
    oldName = op.varName.get();
    updateError();
    op.patch.emitEvent("opTriggerNameChanged", op, op.varName.get());
};

op.on("uiParamPanel", updateError);

function updateError()
{
    if (!op.varName.get())
    {
        op.setUiError("unknowntrigger", "unknown trigger");
    }
    else op.setUiError("unknowntrigger", null);
}


};

Ops.Trigger.TriggerReceive.prototype = new CABLES.Op();
CABLES.OPS["0816c999-f2db-466b-9777-2814573574c5"]={f:Ops.Trigger.TriggerReceive,objName:"Ops.Trigger.TriggerReceive"};




// **************************************************************
// 
// Ops.Html.Notification
// 
// **************************************************************

Ops.Html.Notification = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={"defaultstyle_txt":"visibility: hidden;\nbackground-color: #282828;\ncolor: #fff;\n\npadding: 16px;\nposition: absolute;\nz-index: 9999;\nfont-size: 17px;\nopacity:0;\nborder-radius:10px;\ntext-align:center;\nleft: 50%;\ntransform: translate(-50%, 0);\n",};
const
    triggerAnim = op.inTriggerButton("Trigger animation"),
    inText = op.inString("Text", "Hello! <br> This is a pop up"),
    inClass = op.inString("Class"),
    inStyle = op.inValueEditor("Style", attachments.defaultstyle_txt, "none"),
    inVisible = op.inValueBool("Active", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    fadeInDuration = op.inFloat("Fade in", 0.5),
    holdDuration = op.inFloat("Hold ", 2.0),
    fadeOutDuration = op.inFloat("Fade out", 0.8),
    percentOrPixel = op.inSwitch("mode", ["%", "px"], "%"),
    divSide = op.inSwitch("Side", ["bottom", "top"], "bottom"),
    startPosition = op.inFloat("Starting position", 0),
    endPosition = op.inFloat("Ending position", 5),
    finishedTrigger = op.outTrigger("Finished trigger"),
    finished = op.outBool("Finished", false),
    outElement = op.outObject("DOM Element");

op.setPortGroup("Animation", [fadeInDuration, holdDuration, fadeOutDuration]);
op.setPortGroup("HTML CSS", [inText, inClass, inStyle, inVisible, inBreaks]);
op.setPortGroup("Positioning", [percentOrPixel, divSide, startPosition, endPosition]);

const divid = "notification_" + CABLES.uuid();

// inStyle.setUiAttribs({editorSyntax:'css'});
const listenerElement = null;
let oldStr = null;

let prevDisplay = "block";

const div = document.createElement("div");
div.dataset.op = op.id;
div.id = divid;

const canvas = op.patch.cgl.canvas.parentElement;

canvas.appendChild(div);
outElement.set(div);

inClass.onChange = updateClass;
inBreaks.onChange = inText.onChange = updateText;
inStyle.onChange = updateStyle;
inVisible.onChange = updateVisibility;

triggerAnim.onTriggered = popUpAnim;

updateText();
updateStyle();
warning();

op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

let animInProgress = false;

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = "none";
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateText()
{
    let str = inText.get();

    if (oldStr === str) return;
    oldStr = str;

    if (str && inBreaks.get()) str = str.replace(/(?:\r\n|\r|\n)/g, "<br>");

    if (div.innerHTML != str) div.innerHTML = str;
    outElement.set(null);
    outElement.set(div);
}

function removeElement()
{
    if (div && div.parentNode) div.parentNode.removeChild(div);
}
// inline css inisde div
function updateStyle()
{
    if (inStyle.get() != div.style)
    {
        div.setAttribute("style", inStyle.get());

        updateVisibility();
        outElement.set(null);
        outElement.set(div);
    }
    warning();
}

function updateClass()
{
    div.setAttribute("class", inClass.get());
    warning();
}

op.addEventListener("onEnabledChange", function (enabled)
{
    op.log("css changed");
    setCSSVisible(div.style.visibility != "visible");
});

function warning()
{
    if (inClass.get() && inStyle.get()) op.setUiError("error", "DIV uses external and inline CSS", 1);
    else op.setUiError("error", null);
}

function popUpAnim()
{
    if (!inVisible.get()) return;

    const mode = percentOrPixel.get();
    const start = startPosition.get() + mode;
    const end = endPosition.get() + mode;

    const targetDiv = document.getElementById(divid);
    div.style.display = "block";

    const animData = {};
    // this function cascades into each stage when started
    startAnim(mode, start, end, animData);
}

function startAnim(mode, start, end, animData)
{
    // stop the glitches from it being triggered multiple times
    if (animInProgress) return;

    finished.set(false);
    animInProgress = true;

    animData.easing = ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear"];
    animData.opacity = [0, 1];

    if (divSide.get() == "bottom") animData.bottom = [start, end];
    else animData.top = [start, end];

    document.getElementById(divid).animate(
        animData, fadeInDuration.get() * 1000).onfinish = function ()
    {
        holdAnim(mode, start, end, animData);
    };
}

function holdAnim(mode, start, end, animData)
{
    animData.easing = ["linear", "linear"];
    animData.opacity = [1, 1];

    if (divSide.get() == "bottom") animData.bottom = [end, end];
    else animData.top = [end, end];

    document.getElementById(divid).animate(animData, holdDuration.get() * 1000).onfinish =
        function ()
        {
            endAnim(mode, start, end, animData);
        };
}

function endAnim(mode, start, end, animData)
{
    animData.easing = ["cubic-bezier(0.0, 0.0, 0.2, 1.0)", "linear"];
    animData.opacity = [1, 0];

    if (divSide.get() == "bottom") animData.bottom = [end, start];
    else animData.top = [end, start];

    document.getElementById(divid).animate(
        animData, fadeOutDuration.get() * 1000).onfinish = function ()
    {
        div.style.display = "none";
        animInProgress = false;
        finishedTrigger.trigger();
        finished.set(true);
    };
}


};

Ops.Html.Notification.prototype = new CABLES.Op();
CABLES.OPS["cf3960f3-ced0-4928-9082-a9cf7f8573a6"]={f:Ops.Html.Notification,objName:"Ops.Html.Notification"};




// **************************************************************
// 
// Ops.Time.DelayedTrigger
// 
// **************************************************************

Ops.Time.DelayedTrigger = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe = op.inTrigger("exe"),
    delay = op.inValueFloat("delay", 1),
    cancel = op.inTriggerButton("Cancel"),
    next = op.outTrigger("next"),
    outDelaying = op.outBool("Delaying");

let lastTimeout = null;

cancel.onTriggered = function ()
{
    if (lastTimeout)clearTimeout(lastTimeout);
    lastTimeout = null;
};

exe.onTriggered = function ()
{
    outDelaying.set(true);
    if (lastTimeout)clearTimeout(lastTimeout);

    lastTimeout = setTimeout(
        function ()
        {
            outDelaying.set(false);
            lastTimeout = null;
            next.trigger();
        },
        delay.get() * 1000);
};


};

Ops.Time.DelayedTrigger.prototype = new CABLES.Op();
CABLES.OPS["f4ff66b0-8500-46f7-9117-832aea0c2750"]={f:Ops.Time.DelayedTrigger,objName:"Ops.Time.DelayedTrigger"};




// **************************************************************
// 
// Ops.Html.ReloadPage
// 
// **************************************************************

Ops.Html.ReloadPage = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
var exec=op.inTrigger("Exec");

exec.onTriggered=function()
{
    location.reload();

};

};

Ops.Html.ReloadPage.prototype = new CABLES.Op();
CABLES.OPS["d0060a4e-ffed-4a8d-8f6d-bfd9a23319de"]={f:Ops.Html.ReloadPage,objName:"Ops.Html.ReloadPage"};




// **************************************************************
// 
// Ops.Vars.VarGetNumber_v2
// 
// **************************************************************

Ops.Vars.VarGetNumber_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const val = op.outNumber("Value");
op.varName = op.inValueSelect("Variable", [], "", true);

new CABLES.VarGetOpWrapper(op, "number", op.varName, val);


};

Ops.Vars.VarGetNumber_v2.prototype = new CABLES.Op();
CABLES.OPS["421f5b52-c0fa-47c4-8b7a-012b9e1c864a"]={f:Ops.Vars.VarGetNumber_v2,objName:"Ops.Vars.VarGetNumber_v2"};




// **************************************************************
// 
// Ops.String.StringCompose_v3
// 
// **************************************************************

Ops.String.StringCompose_v3 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    format=op.inString('Format',"hello $a, $b $c und $d"),
    a=op.inString('String A','world'),
    b=op.inString('String B',1),
    c=op.inString('String C',2),
    d=op.inString('String D',3),
    e=op.inString('String E'),
    f=op.inString('String F'),
    result=op.outString("Result");

format.onChange=
    a.onChange=
    b.onChange=
    c.onChange=
    d.onChange=
    e.onChange=
    f.onChange=update;

update();

function update()
{
    var str=format.get()||'';
    if(typeof str!='string')
        str='';

    str = str.replace(/\$a/g, a.get());
    str = str.replace(/\$b/g, b.get());
    str = str.replace(/\$c/g, c.get());
    str = str.replace(/\$d/g, d.get());
    str = str.replace(/\$e/g, e.get());
    str = str.replace(/\$f/g, f.get());

    result.set(str);
}

};

Ops.String.StringCompose_v3.prototype = new CABLES.Op();
CABLES.OPS["6afea9f4-728d-4f3c-9e75-62ddc1448bf0"]={f:Ops.String.StringCompose_v3,objName:"Ops.String.StringCompose_v3"};




// **************************************************************
// 
// Ops.Html.CSS_v2
// 
// **************************************************************

Ops.Html.CSS_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const code = op.inStringEditor("css code");

code.setUiAttribs(
    {
        "editorSyntax": "css",
        "ignoreBigPort": true
    });

let styleEle = null;
const eleId = "css_" + CABLES.uuid();

code.onChange = update;
update();

function getCssContent()
{
    let css = code.get();
    if (css)
    {
        let patchId = null;
        if (op.storage && op.storage.blueprint && op.storage.blueprint.patchId)
        {
            patchId = op.storage.blueprint.patchId;
        }
        css = css.replace(new RegExp("{{ASSETPATH}}", "g"), op.patch.getAssetPath(patchId));
    }
    return css;
}

function update()
{
    styleEle = document.getElementById(eleId);

    if (styleEle)
    {
        styleEle.textContent = getCssContent();
    }
    else
    {
        styleEle = document.createElement("style");
        styleEle.type = "text/css";
        styleEle.id = eleId;
        styleEle.textContent = attachments.css_spinner;

        const head = document.getElementsByTagName("body")[0];
        head.appendChild(styleEle);
    }
}

op.onDelete = function ()
{
    styleEle = document.getElementById(eleId);
    if (styleEle)styleEle.remove();
};


};

Ops.Html.CSS_v2.prototype = new CABLES.Op();
CABLES.OPS["a56d3edd-06ad-44ed-9810-dbf714600c67"]={f:Ops.Html.CSS_v2,objName:"Ops.Html.CSS_v2"};




// **************************************************************
// 
// Ops.String.StringEditor
// 
// **************************************************************

Ops.String.StringEditor = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    v = op.inStringEditor("value", ""),
    syntax = op.inValueSelect("Syntax", ["text", "glsl", "css", "html", "xml", "json", "javascript", "inline-css", "sql"], "text"),
    result = op.outString("Result");

syntax.onChange = updateSyntax;

function updateSyntax()
{
    let s = syntax.get();
    if (s == "javascript")s = "js";
    v.setUiAttribs({ "editorSyntax": s });
}

v.onChange = function ()
{
    result.set(v.get());
};


};

Ops.String.StringEditor.prototype = new CABLES.Op();
CABLES.OPS["6468b7c1-f63e-4db4-b809-4b203d27ead3"]={f:Ops.String.StringEditor,objName:"Ops.String.StringEditor"};




// **************************************************************
// 
// Ops.Devices.Mouse.Mouse_v3
// 
// **************************************************************

Ops.Devices.Mouse.Mouse_v3 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inCoords = op.inSwitch("Coordinates", ["Pixel", "Pixel Display", "-1 to 1", "0 to 1"], "-1 to 1"),
    area = op.inValueSelect("Area", ["Canvas", "Document", "Parent Element", "Canvas Area"], "Canvas"),
    flipY = op.inValueBool("flip y", true),
    rightClickPrevDef = op.inBool("right click prevent default", true),
    touchscreen = op.inValueBool("Touch support", true),
    active = op.inValueBool("Active", true),
    outMouseX = op.outNumber("x", 0),
    outMouseY = op.outNumber("y", 0),
    mouseClick = op.outTrigger("click"),
    mouseClickRight = op.outTrigger("click right"),
    mouseDown = op.outBoolNum("Button is down"),
    mouseOver = op.outBoolNum("Mouse is hovering");

const cgl = op.patch.cgl;
let normalize = 1;
let listenerElement = null;
let sizeElement = null;
area.onChange = addListeners;

inCoords.onChange = updateCoordNormalizing;
op.onDelete = removeListeners;

addListeners();

op.on("loadedValueSet",
    () =>
    {
        if (normalize == 0)
        {
            outMouseX.set(sizeElement.clientWidth / 2);
            outMouseY.set(sizeElement.clientHeight / 2);
        }
        if (normalize == 1)
        {
            outMouseX.set(0);
            outMouseY.set(0);
        }
        if (normalize == 2)
        {
            outMouseX.set(0.5);
            outMouseY.set(0.5);
        }
    });

function setValue(x, y)
{
    x = x || 0;
    y = y || 0;

    if (normalize == 0) // pixel
    {
        outMouseX.set(x);
        outMouseY.set(y);
    }
    else
    if (normalize == 3) // pixel css
    {
        outMouseX.set(x * cgl.pixelDensity);
        outMouseY.set(y * cgl.pixelDensity);
    }
    else
    {
        let w = sizeElement.clientWidth / cgl.pixelDensity;
        let h = sizeElement.clientHeight / cgl.pixelDensity;

        w = w || 1;
        h = h || 1;

        if (normalize == 1) // -1 to 1
        {
            let xx = (x / w * 2.0 - 1.0);
            let yy = (y / h * 2.0 - 1.0);

            outMouseX.set(xx);
            outMouseY.set(yy);
        }
        else if (normalize == 2) // 0 to 1
        {
            let xx = x / w;
            let yy = y / h;

            outMouseX.set(xx);
            outMouseY.set(yy);
        }
    }
}

function checkHovering(e)
{
    if (area.get() === "Canvas Area")
    {
        const r = sizeElement.getBoundingClientRect();

        return (
            e.clientX > r.left &&
            e.clientX < r.left + r.width &&
            e.clientY > r.top &&
            e.clientY < r.top + r.height
        );
    }
    return true;
}

touchscreen.onChange = function ()
{
    removeListeners();
    addListeners();
};

active.onChange = function ()
{
    if (listenerElement)removeListeners();
    if (active.get())addListeners();
};

function updateCoordNormalizing()
{
    if (inCoords.get() == "Pixel")normalize = 0;
    else if (inCoords.get() == "-1 to 1")normalize = 1;
    else if (inCoords.get() == "0 to 1")normalize = 2;
    else if (inCoords.get() == "Pixel CSS")normalize = 3;
}

function onMouseEnter(e)
{
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function onMouseDown(e)
{
    if (!checkHovering(e)) return;
    mouseDown.set(true);
}

function onMouseUp(e)
{
    mouseDown.set(false);
}

function onClickRight(e)
{
    if (!checkHovering(e)) return;
    mouseClickRight.trigger();
    if (rightClickPrevDef.get()) e.preventDefault();
}

function onmouseclick(e)
{
    if (!checkHovering(e)) return;
    mouseClick.trigger();
}

function onMouseLeave(e)
{
    mouseDown.set(false);
    mouseOver.set(checkHovering(e));
}

function setCoords(e)
{
    let x = e.clientX;
    let y = e.clientY;

    if (area.get() != "Document")
    {
        x = e.offsetX;
        y = e.offsetY;
    }
    if (area.get() === "Canvas Area")
    {
        const r = sizeElement.getBoundingClientRect();
        x = e.clientX - r.left;
        y = e.clientY - r.top;
    }

    if (flipY.get()) y = sizeElement.clientHeight - y;

    setValue(x / cgl.pixelDensity, y / cgl.pixelDensity);
}

function onmousemove(e)
{
    mouseOver.set(checkHovering(e));
    setCoords(e);
}

function ontouchmove(e)
{
    if (event.touches && event.touches.length > 0) setCoords(e.touches[0]);
}

function ontouchstart(event)
{
    mouseDown.set(true);

    if (event.touches && event.touches.length > 0) onMouseDown(event.touches[0]);
}

function ontouchend(event)
{
    mouseDown.set(false);
    onMouseUp();
}

function removeListeners()
{
    if (!listenerElement) return;
    listenerElement.removeEventListener("touchend", ontouchend);
    listenerElement.removeEventListener("touchstart", ontouchstart);
    listenerElement.removeEventListener("touchmove", ontouchmove);

    listenerElement.removeEventListener("click", onmouseclick);
    listenerElement.removeEventListener("mousemove", onmousemove);
    listenerElement.removeEventListener("mouseleave", onMouseLeave);
    listenerElement.removeEventListener("mousedown", onMouseDown);
    listenerElement.removeEventListener("mouseup", onMouseUp);
    listenerElement.removeEventListener("mouseenter", onMouseEnter);
    listenerElement.removeEventListener("contextmenu", onClickRight);
    listenerElement = null;
}

function addListeners()
{
    if (listenerElement || !active.get())removeListeners();
    if (!active.get()) return;

    listenerElement = sizeElement = cgl.canvas;
    if (area.get() == "Canvas Area")
    {
        sizeElement = cgl.canvas.parentElement;
        listenerElement = document.body;
    }
    if (area.get() == "Document") sizeElement = listenerElement = document.body;
    if (area.get() == "Parent Element") listenerElement = sizeElement = cgl.canvas.parentElement;

    if (touchscreen.get())
    {
        listenerElement.addEventListener("touchend", ontouchend);
        listenerElement.addEventListener("touchstart", ontouchstart);
        listenerElement.addEventListener("touchmove", ontouchmove);
    }

    listenerElement.addEventListener("mousemove", onmousemove);
    listenerElement.addEventListener("mouseleave", onMouseLeave);
    listenerElement.addEventListener("mousedown", onMouseDown);
    listenerElement.addEventListener("mouseup", onMouseUp);
    listenerElement.addEventListener("mouseenter", onMouseEnter);
    listenerElement.addEventListener("contextmenu", onClickRight);
    listenerElement.addEventListener("click", onmouseclick);
}


};

Ops.Devices.Mouse.Mouse_v3.prototype = new CABLES.Op();
CABLES.OPS["6d1edbc0-088a-43d7-9156-918fb3d7f24b"]={f:Ops.Devices.Mouse.Mouse_v3,objName:"Ops.Devices.Mouse.Mouse_v3"};




// **************************************************************
// 
// Ops.Boolean.TriggerChangedTrue
// 
// **************************************************************

Ops.Boolean.TriggerChangedTrue = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
let val = op.inValueBool("Value", false);
let next = op.outTrigger("Next");
let oldVal = 0;

val.onChange = function ()
{
    let newVal = val.get();
    if (!oldVal && newVal)
    {
        oldVal = true;
        next.trigger();
    }
    else
    {
        oldVal = false;
    }
};


};

Ops.Boolean.TriggerChangedTrue.prototype = new CABLES.Op();
CABLES.OPS["385197e1-8b34-4d1c-897f-d1386d99e3b3"]={f:Ops.Boolean.TriggerChangedTrue,objName:"Ops.Boolean.TriggerChangedTrue"};




// **************************************************************
// 
// Ops.String.NumberToString_v2
// 
// **************************************************************

Ops.String.NumberToString_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    val = op.inValue("Number"),
    result = op.outString("Result");

val.onChange = update;
update();

function update()
{
    result.set(String(val.get() || 0));
}


};

Ops.String.NumberToString_v2.prototype = new CABLES.Op();
CABLES.OPS["5c6d375a-82db-4366-8013-93f56b4061a9"]={f:Ops.String.NumberToString_v2,objName:"Ops.String.NumberToString_v2"};




// **************************************************************
// 
// Ops.Boolean.And
// 
// **************************************************************

Ops.Boolean.And = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    bool0 = op.inValueBool("bool 1"),
    bool1 = op.inValueBool("bool 2"),
    result = op.outBoolNum("result");

bool0.onChange =
bool1.onChange = exec;

function exec()
{
    result.set(bool1.get() && bool0.get());
}


};

Ops.Boolean.And.prototype = new CABLES.Op();
CABLES.OPS["c26e6ce0-8047-44bb-9bc8-5a4f911ed8ad"]={f:Ops.Boolean.And,objName:"Ops.Boolean.And"};




// **************************************************************
// 
// Ops.Trigger.SetNumberOnTrigger
// 
// **************************************************************

Ops.Trigger.SetNumberOnTrigger = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    setValuePort = op.inTriggerButton("Set"),
    valuePort = op.inValueFloat("Number"),
    outNext = op.outTrigger("Next"),
    outValuePort = op.outNumber("Out Value");

outValuePort.changeAlways = true;

setValuePort.onTriggered = function ()
{
    outValuePort.set(valuePort.get());
    outNext.trigger();
};


};

Ops.Trigger.SetNumberOnTrigger.prototype = new CABLES.Op();
CABLES.OPS["9989b1c0-1073-4d5f-bfa0-36dd98b66e27"]={f:Ops.Trigger.SetNumberOnTrigger,objName:"Ops.Trigger.SetNumberOnTrigger"};




// **************************************************************
// 
// Ops.Math.Math
// 
// **************************************************************

Ops.Math.Math = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const num0 = op.inFloat("number 0", 0),
    num1 = op.inFloat("number 1", 0),
    mathDropDown = op.inSwitch("math mode", ["+", "-", "*", "/", "%", "min", "max"], "+"),
    result = op.outNumber("result");

let mathFunc;

num0.onChange = num1.onChange = update;
mathDropDown.onChange = onFilterChange;

let n0 = 0;
let n1 = 0;

const mathFuncAdd = function (a, b) { return a + b; };
const mathFuncSub = function (a, b) { return a - b; };
const mathFuncMul = function (a, b) { return a * b; };
const mathFuncDiv = function (a, b) { return a / b; };
const mathFuncMod = function (a, b) { return a % b; };
const mathFuncMin = function (a, b) { return Math.min(a, b); };
const mathFuncMax = function (a, b) { return Math.max(a, b); };

function onFilterChange()
{
    let mathSelectValue = mathDropDown.get();

    if (mathSelectValue == "+") mathFunc = mathFuncAdd;
    else if (mathSelectValue == "-") mathFunc = mathFuncSub;
    else if (mathSelectValue == "*") mathFunc = mathFuncMul;
    else if (mathSelectValue == "/") mathFunc = mathFuncDiv;
    else if (mathSelectValue == "%") mathFunc = mathFuncMod;
    else if (mathSelectValue == "min") mathFunc = mathFuncMin;
    else if (mathSelectValue == "max") mathFunc = mathFuncMax;
    update();
    op.setUiAttrib({ "extendTitle": mathSelectValue });
}

function update()
{
    n0 = num0.get();
    n1 = num1.get();

    result.set(mathFunc(n0, n1));
}

onFilterChange();


};

Ops.Math.Math.prototype = new CABLES.Op();
CABLES.OPS["e9fdcaca-a007-4563-8a4d-e94e08506e0f"]={f:Ops.Math.Math,objName:"Ops.Math.Math"};




// **************************************************************
// 
// Ops.Value.GateNumber
// 
// **************************************************************

Ops.Value.GateNumber = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const valueInPort = op.inValue("Value In", 0);
const passThroughPort = op.inValueBool("Pass Through");
const valueOutPort = op.outNumber("Value Out");

valueInPort.onChange = update;
passThroughPort.onChange = update;

valueInPort.changeAlways = true;
valueOutPort.changeAlways = true;

function update()
{
    if (passThroughPort.get())
    {
        valueOutPort.set(valueInPort.get());
    }
}


};

Ops.Value.GateNumber.prototype = new CABLES.Op();
CABLES.OPS["594105c8-1fdb-4f3c-bbd5-29b9ad6b33e0"]={f:Ops.Value.GateNumber,objName:"Ops.Value.GateNumber"};




// **************************************************************
// 
// Ops.Boolean.TriggerChangedFalse
// 
// **************************************************************

Ops.Boolean.TriggerChangedFalse = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
let val = op.inValueBool("Value", false);
let next = op.outTrigger("Next");

let oldVal = 0;

val.onChange = function ()
{
    let newVal = val.get();
    if (oldVal && !newVal)
    {
        oldVal = false;
        next.trigger();
    }
    else
    {
        oldVal = true;
    }
};


};

Ops.Boolean.TriggerChangedFalse.prototype = new CABLES.Op();
CABLES.OPS["6387bcb0-6091-4199-8ab7-f96ad4aa3c7d"]={f:Ops.Boolean.TriggerChangedFalse,objName:"Ops.Boolean.TriggerChangedFalse"};




// **************************************************************
// 
// Ops.User.rambodc.AccumOnReset
// 
// **************************************************************

Ops.User.rambodc.AccumOnReset = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const inputValue = op.inValueFloat("Input");
const storeTrigger = op.inTriggerButton("Store Last Number");
const clearTrigger = op.inTriggerButton("Clear");

// outputs
const result = op.outNumber("Result");

// variable to keep track of the last stored value
let lastStoredValue = 0;

// when the store trigger is activated, add the current input value to the last stored value
storeTrigger.onTriggered = function() {
    lastStoredValue += inputValue.get();
    result.set(lastStoredValue);
}

// when the input value changes, just update the output to reflect the sum of the last stored value and the current input value
inputValue.onChange = function() {
    result.set(lastStoredValue + inputValue.get());
}

// when the clear trigger is activated, reset all values to zero
clearTrigger.onTriggered = function() {
    lastStoredValue = 0;
    inputValue.set(0);
    result.set(0);
}


};

Ops.User.rambodc.AccumOnReset.prototype = new CABLES.Op();
CABLES.OPS["22d1926b-2b2d-4923-a53e-9f719d791464"]={f:Ops.User.rambodc.AccumOnReset,objName:"Ops.User.rambodc.AccumOnReset"};




// **************************************************************
// 
// Ops.Math.FlipSign
// 
// **************************************************************

Ops.Math.FlipSign = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inval = op.inValueFloat("Value", 1),
    result = op.outNumber("Result");

inval.onChange = update;
update();

function update()
{
    result.set(inval.get() * -1);
}


};

Ops.Math.FlipSign.prototype = new CABLES.Op();
CABLES.OPS["f5c858a2-2654-4108-86fe-319efa70ecec"]={f:Ops.Math.FlipSign,objName:"Ops.Math.FlipSign"};




// **************************************************************
// 
// Ops.Trigger.TriggerOnce
// 
// **************************************************************

Ops.Trigger.TriggerOnce = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe = op.inTriggerButton("Exec"),
    reset = op.inTriggerButton("Reset"),
    next = op.outTrigger("Next"),
    outTriggered = op.outBoolNum("Was Triggered");

let triggered = false;

op.toWorkPortsNeedToBeLinked(exe);

reset.onTriggered = function ()
{
    triggered = false;
    outTriggered.set(triggered);
};

exe.onTriggered = function ()
{
    if (triggered) return;

    triggered = true;
    next.trigger();
    outTriggered.set(triggered);
};


};

Ops.Trigger.TriggerOnce.prototype = new CABLES.Op();
CABLES.OPS["cf3544e4-e392-432b-89fd-fcfb5c974388"]={f:Ops.Trigger.TriggerOnce,objName:"Ops.Trigger.TriggerOnce"};




// **************************************************************
// 
// Ops.String.SwitchStringBoolean
// 
// **************************************************************

Ops.String.SwitchStringBoolean = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inBool=op.inValueBool("Boolean"),
    inStrTrue=op.inString("True","Yes"),
    inStrFalse=op.inString("False","No"),
    result=op.outString("Result");

inBool.onChange=
inStrFalse.onChange=
inStrTrue.onChange=update;

function update()
{
    if(inBool.get())result.set(inStrTrue.get());
        else result.set(inStrFalse.get());
}

update();

};

Ops.String.SwitchStringBoolean.prototype = new CABLES.Op();
CABLES.OPS["19e3c428-22ce-45a3-b903-fddfc46fc0a3"]={f:Ops.String.SwitchStringBoolean,objName:"Ops.String.SwitchStringBoolean"};




// **************************************************************
// 
// Ops.String.String_v2
// 
// **************************************************************

Ops.String.String_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    v=op.inString("value",""),
    result=op.outString("String");

v.onChange=function()
{
    result.set(v.get());
};



};

Ops.String.String_v2.prototype = new CABLES.Op();
CABLES.OPS["d697ff82-74fd-4f31-8f54-295bc64e713d"]={f:Ops.String.String_v2,objName:"Ops.String.String_v2"};




// **************************************************************
// 
// Ops.Json.AjaxRequest_v2
// 
// **************************************************************

Ops.Json.AjaxRequest_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const filename = op.inUrl("file"),
    jsonp = op.inValueBool("JsonP", false),
    headers = op.inObject("headers", {}),
    inBody = op.inStringEditor("body", ""),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inContentType = op.inString("Content-Type", "application/json"),
    inParseJson = op.inBool("parse json", true),
    inAutoRequest = op.inBool("Auto request", true),
    reloadTrigger = op.inTriggerButton("reload"),
    outData = op.outObject("data"),
    outString = op.outString("response"),
    outDuration = op.outNumber("Duration MS", 0),
    outStatus = op.outNumber("Status Code", 0),

    isLoading = op.outBoolNum("Is Loading", false),
    outTrigger = op.outTrigger("Loaded");

filename.setUiAttribs({ "title": "URL" });
reloadTrigger.setUiAttribs({ "buttonTitle": "trigger request" });

outData.ignoreValueSerialize = true;
outString.ignoreValueSerialize = true;

inAutoRequest.onChange = filename.onChange = jsonp.onChange = headers.onChange = inMethod.onChange = inParseJson.onChange = function ()
{
    delayedReload(false);
};

reloadTrigger.onTriggered = function ()
{
    delayedReload(true);
};

let reloadTimeout = 0;

function delayedReload(force = false)
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () { reload(null, force); }, 100);
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1) reload(true);
};

function reload(addCachebuster, force = false)
{
    if (!inAutoRequest.get() && !force) return;
    if (!filename.get()) return;

    // op.patch.loading.finished(loadingId);

    const loadingId = op.patch.loading.start("jsonFile", "" + filename.get(), op);
    isLoading.set(true);

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    op.setUiError("jsonerr", null);

    let httpClient = CABLES.ajax;
    if (jsonp.get()) httpClient = CABLES.jsonp;

    let url = op.patch.getFilePath(filename.get());
    if (addCachebuster)url += "?rnd=" + CABLES.generateUUID();

    op.patch.loading.addAssetLoadingTask(() =>
    {
        const body = inBody.get();
        const startTime = performance.now();
        httpClient(
            url,
            (err, _data, xhr) =>
            {
                outDuration.set(Math.round(performance.now() - startTime));
                outData.set(null);
                outString.set(null);
                outStatus.set(xhr.status);

                // if (err)
                // {
                //     op.logError(err);
                //     // op.patch.loading.finished(loadingId);
                //     // isLoading.set(false);
                //     // return;
                // }
                try
                {
                    let data = _data;
                    if (typeof data === "string" && inParseJson.get())
                    {
                        data = JSON.parse(_data);
                        outData.set(data);
                    }
                    outString.set(_data);
                    op.uiAttr({ "error": null });
                    op.patch.loading.finished(loadingId);
                    outTrigger.trigger();
                    isLoading.set(false);
                }
                catch (e)
                {
                    op.logError(e);
                    op.setUiError("jsonerr", "Problem while loading json:<br/>" + e);
                    op.patch.loading.finished(loadingId);
                    isLoading.set(false);
                }
            },
            inMethod.get(),
            (body && body.length > 0) ? body : null,
            inContentType.get(),
            null,
            headers.get() || {}
        );
    });
}


};

Ops.Json.AjaxRequest_v2.prototype = new CABLES.Op();
CABLES.OPS["e0879058-5505-4dc4-b9ff-47a3d3c8a71a"]={f:Ops.Json.AjaxRequest_v2,objName:"Ops.Json.AjaxRequest_v2"};




// **************************************************************
// 
// Ops.User.rambodc.TextInput_Area
// 
// **************************************************************

Ops.User.rambodc.TextInput_Area = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    parentPort = op.inObject("Link"),
    labelPort = op.inString("Text", "Text"),
    defaultValuePort = op.inString("Default", ""),
    inPlaceholder = op.inString("Placeholder", ""),
    inType = op.inSwitch("Type", ["text", "password"], "text"),
    inTextArea = op.inBool("TextArea", false),
    inGreyOut = op.inBool("Grey Out", false),
    inVisible = op.inBool("Visible", true),
    inClear = op.inTriggerButton("Clear"),
    siblingsPort = op.outObject("Children"),
    valuePort = op.outString("Result", defaultValuePort.get()),
    outFocus = op.outBool("Focus");

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text-input");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

label.addEventListener("dblclick", function ()
{
    valuePort.set(defaultValuePort.get());
    input.value = defaultValuePort.get();
});

let input = null;
creatElement();

op.toWorkPortsNeedToBeLinked(parentPort);

inTextArea.onChange = creatElement;
inType.onChange = setAttribs;

function setAttribs()
{
    input.setAttribute("type", inType.get());
    input.setAttribute("value", defaultValuePort.get());
    input.setAttribute("placeholder", inPlaceholder.get());
}

function creatElement()
{
    if (input)input.remove();
    if (!inTextArea.get())
    {
        input = document.createElement("input");
    }
    else
    {
        input = document.createElement("textarea");
        onDefaultValueChanged();
    }

    input.classList.add("sidebar__text-input-input-area");

    setAttribs();

    el.appendChild(input);
    input.addEventListener("input", onInput);
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);
}

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inClear.onTriggered = () =>
{
    input.value = "";
};

function onFocus()
{
    outFocus.set(true);
}

function onBlur()
{
    outFocus.set(false);
}

inPlaceholder.onChange = () =>
{
    input.setAttribute("placeholder", inPlaceholder.get());
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;

// functions

function onInput(ev)
{
    valuePort.set(ev.target.value);
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI)
    {
        op.setTitle("Text Input: " + labelText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

inClear.onTriggered = () => {
  input.value = "";
  valuePort.set("");
};


};

Ops.User.rambodc.TextInput_Area.prototype = new CABLES.Op();
CABLES.OPS["d323998b-6ad1-4d9c-b670-886ed46fc82b"]={f:Ops.User.rambodc.TextInput_Area,objName:"Ops.User.rambodc.TextInput_Area"};




// **************************************************************
// 
// Ops.User.rambodc.Button_Green
// 
// **************************************************************

Ops.User.rambodc.Button_Green = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("div");
input.classList.add("sidebar__button-input-green");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_Green.prototype = new CABLES.Op();
CABLES.OPS["b5a0cbd3-250c-4189-ade5-dfd7e79eedde"]={f:Ops.User.rambodc.Button_Green,objName:"Ops.User.rambodc.Button_Green"};




// **************************************************************
// 
// Ops.User.rambodc.SidebarText_Completion
// 
// **************************************************************

Ops.User.rambodc.SidebarText_Completion = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");
const inVisible = op.inBool("Visible", true);

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");

const label = document.createElement("div");
label.classList.add("sidebar__item-label-completion");
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

function onVisibilityChanged() {
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() {
    labelPort.set('');
    onLabelTextChanged();
}

function onIdChanged() {
    el.id = inId.get();
}

function onLabelTextChanged() {
    let labelText = labelPort.get();

    if(labelText) {
        labelText = labelText.trimStart().replace(/\n/g, '<br/>');
    } else {
        labelText = "";
    }

    label.innerHTML = labelText;

    if (CABLES.UI) {
        if (labelText && typeof labelText === "string") {
            op.setTitle("Text: " + labelText.substring(0, 10));
        } else {
            op.setTitle("Text");
        }
    }
}


function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.SidebarText_Completion.prototype = new CABLES.Op();
CABLES.OPS["9a96cdef-3a4f-4989-a6da-49daa676fb02"]={f:Ops.User.rambodc.SidebarText_Completion,objName:"Ops.User.rambodc.SidebarText_Completion"};




// **************************************************************
// 
// Ops.User.rambodc.SidebarText_Prompt
// 
// **************************************************************

Ops.User.rambodc.SidebarText_Prompt = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");
const inVisible = op.inBool("Visible", true);

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");

const label = document.createElement("div");
label.classList.add("sidebar__item-label-prompt");
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

function onVisibilityChanged() {
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() {
    labelPort.set('');
    onLabelTextChanged();
}

function onIdChanged() {
    el.id = inId.get();
}

function onLabelTextChanged() {
    let labelText = labelPort.get();

    if(labelText) {
        labelText = labelText.trimStart().replace(/\n/g, '<br/>');
    } else {
        labelText = "";
    }

    label.innerHTML = labelText;

    if (CABLES.UI) {
        if (labelText && typeof labelText === "string") {
            op.setTitle("Text: " + labelText.substring(0, 10));
        } else {
            op.setTitle("Text");
        }
    }
}


function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.SidebarText_Prompt.prototype = new CABLES.Op();
CABLES.OPS["8820d980-08bb-4e5c-9307-2117f7dcd322"]={f:Ops.User.rambodc.SidebarText_Prompt,objName:"Ops.User.rambodc.SidebarText_Prompt"};




// **************************************************************
// 
// Ops.Trigger.TriggerString
// 
// **************************************************************

Ops.Trigger.TriggerString = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exec = op.inTriggerButton("Trigger"),
    inString = op.inString("String", ""),
    next = op.outTrigger("Next"),
    outString = op.outString("Result");

outString.changeAlways = true;
exec.onTriggered = function ()
{
    outString.set(inString.get());
    next.trigger();
};


};

Ops.Trigger.TriggerString.prototype = new CABLES.Op();
CABLES.OPS["217482b8-2ee6-4609-b7ad-4550e6aaa371"]={f:Ops.Trigger.TriggerString,objName:"Ops.Trigger.TriggerString"};




// **************************************************************
// 
// Ops.User.rambodc.Empty_String_Check1
// 
// **************************************************************

Ops.User.rambodc.Empty_String_Check1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const inExec = op.inTriggerButton("Exe");

const inString1 = op.inString("String Input 1", "");
const inErrorMessage1 = op.inString("Error Message 1", "");
const inBool1 = op.inBool("Bool 1", false);

const inString2 = op.inString("String Input 2", "");
const inErrorMessage2 = op.inString("Error Message 2", "");
const inBool2 = op.inBool("Bool 2", false);

const inString3 = op.inString("String Input 3", "");
const inErrorMessage3 = op.inString("Error Message 3", "");
const inBool3 = op.inBool("Bool 3", false);

const inString4 = op.inString("String Input 4", "");
const inErrorMessage4 = op.inString("Error Message 4", "");
const inBool4 = op.inBool("Bool 4", false);

// outputs
const outSuccess = op.outTrigger("Success");
const outFail = op.outTrigger("Fail");
const outErrorMessage = op.outString("Output Error Message");

outErrorMessage.changeAlways = true;

inExec.onTriggered = function ()
{
    let errorMessage = "";

    if (inBool1.get() && inString1.get().trim() === "")
    {
        errorMessage += inErrorMessage1.get() + " ";
    }

    if (inBool2.get() && inString2.get().trim() === "")
    {
        errorMessage += inErrorMessage2.get() + " ";
    }

    if (inBool3.get() && inString3.get().trim() === "")
    {
        errorMessage += inErrorMessage3.get() + " ";
    }

    if (inBool4.get() && inString4.get().trim() === "")
    {
        errorMessage += inErrorMessage4.get() + " ";
    }

    if (errorMessage !== "")
    {
        outErrorMessage.set(errorMessage.trim());
        outFail.trigger();
    }
    else
    {
        outSuccess.trigger();
    }
};


};

Ops.User.rambodc.Empty_String_Check1.prototype = new CABLES.Op();
CABLES.OPS["7b6873fb-d5db-45fe-9330-73a8290e8795"]={f:Ops.User.rambodc.Empty_String_Check1,objName:"Ops.User.rambodc.Empty_String_Check1"};




// **************************************************************
// 
// Ops.User.rambodc.StringTrim_All1
// 
// **************************************************************

Ops.User.rambodc.StringTrim_All1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inStr = op.inString("String"),
    outStr = op.outString("Result",'');

inStr.onChange = function()
{
    let str = inStr.get();
    if (!str) {
        outStr.set('');
    } else {
        // Remove all instances of white space, line breaks, carriage returns, and tabs
        str = str.replace(/[\s\n\r\t]+/g, ' ');
        outStr.set(str);
    }
};


};

Ops.User.rambodc.StringTrim_All1.prototype = new CABLES.Op();
CABLES.OPS["b1be27a6-f0b0-4f61-902b-d09e897418e3"]={f:Ops.User.rambodc.StringTrim_All1,objName:"Ops.User.rambodc.StringTrim_All1"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_Library
// 
// **************************************************************

Ops.User.rambodc.XRPL_Library = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Here we inmport XRPL CDN Library once for each patch



function addScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');

    s.setAttribute('src', src);
    s.addEventListener('load', resolve);
    s.addEventListener('error', reject);

    document.body.appendChild(s);
  });
}

addScript("https://unpkg.com/xrpl/build/xrpl-latest-min.js")


};

Ops.User.rambodc.XRPL_Library.prototype = new CABLES.Op();
CABLES.OPS["d7d91b26-8822-4483-87cb-ab03775df4a5"]={f:Ops.User.rambodc.XRPL_Library,objName:"Ops.User.rambodc.XRPL_Library"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_SecretNumbers_Library
// 
// **************************************************************

Ops.User.rambodc.XRPL_SecretNumbers_Library = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};


function addScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');

    s.setAttribute('src', src);
    s.addEventListener('load', resolve);
    s.addEventListener('error', reject);

    document.body.appendChild(s);
  });
}

addScript("https://cdn.jsdelivr.net/npm/xrpl-secret-numbers/dist/browserified.js")


};

Ops.User.rambodc.XRPL_SecretNumbers_Library.prototype = new CABLES.Op();
CABLES.OPS["6917fed5-225f-47ef-bee9-39793386f809"]={f:Ops.User.rambodc.XRPL_SecretNumbers_Library,objName:"Ops.User.rambodc.XRPL_SecretNumbers_Library"};




// **************************************************************
// 
// Ops.Trigger.TriggerExtender
// 
// **************************************************************

Ops.Trigger.TriggerExtender = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inTriggerPort = op.inTriggerButton("Execute"),
    outTriggerPort = op.outTrigger("Next");

inTriggerPort.onTriggered = function ()
{
    outTriggerPort.trigger();
};


};

Ops.Trigger.TriggerExtender.prototype = new CABLES.Op();
CABLES.OPS["7ef594f3-4907-47b0-a2d3-9854eda1679d"]={f:Ops.Trigger.TriggerExtender,objName:"Ops.Trigger.TriggerExtender"};




// **************************************************************
// 
// Ops.Sidebar.SidebarText_v2
// 
// **************************************************************

Ops.Sidebar.SidebarText_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text", "Value");
const inId = op.inValueString("Id", "");

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createElement("div");// document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// functions

function onIdChanged()
{
    el.id = inId.get();
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.innerHTML = labelText;
    if (CABLES.UI)
    {
        if (labelText && typeof labelText === "string")
        {
            op.setTitle("Text: " + labelText.substring(0, 10)); // display first 10 characters of text in op title
        }
        else
        {
            op.setTitle("Text");
        }
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.Sidebar.SidebarText_v2.prototype = new CABLES.Op();
CABLES.OPS["cc591cc3-ff23-4817-907c-e5be7d5c059d"]={f:Ops.Sidebar.SidebarText_v2,objName:"Ops.Sidebar.SidebarText_v2"};




// **************************************************************
// 
// Ops.Json.ObjectGetArrayValuesByPath
// 
// **************************************************************

Ops.Json.ObjectGetArrayValuesByPath = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");
const foundOut = op.outBool("Found");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    let result = [];
    const path = pathIn.get();
    op.setUiError("path", null);

    if (data && path)
    {
        if (typeof data !== "object")
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else if (Array.isArray(data))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input of type " + (typeof data) + " is not an object");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            foundOut.set(false);

            // find first array in path
            let checkPath = "";
            let pathPrefix = "";
            let pathSuffix = "";
            let checkData = null;
            for (let i = 0; i < parts.length; i++)
            {
                checkPath += parts[i];
                checkData = resolve(checkPath, data);
                if (Array.isArray(checkData))
                {
                    pathPrefix = checkPath;
                    pathSuffix = parts.splice(i + 2, parts.length - (i + 2)).join(".");
                    break;
                }
                checkPath += ".";
            }
            if (checkData)
            {
                if (parts.length > 1)
                {
                    for (let i = 0; i < checkData.length; i++)
                    {
                        let resolvePath = pathPrefix + "." + i;
                        if (pathSuffix && pathSuffix !== "")
                        {
                            resolvePath += "." + pathSuffix;
                        }
                        const resolvedData = resolve(resolvePath, data);
                        if (typeof resolvedData !== "undefined")
                        {
                            foundOut.set(true);
                        }
                        result.push(resolvedData);
                    }
                }
                else
                {
                    if (Array.isArray(checkData))
                    {
                        result = checkData;
                    }
                    else
                    {
                        result = [checkData];
                    }
                    foundOut.set(true);
                }

                const titleParts = pathIn.get().split(".");
                const extendTitle = titleParts[titleParts.length - 1] + "";
                op.setUiAttrib({ "extendTitle": extendTitle });
            }
            if (foundOut.get())
            {
                resultOut.setRef(result);
            }
            else
            {
                op.setUiError("path", "given path seems to be invalid!", 1);
                resultOut.setRef([]);
            }
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => { return prev && prev[curr]; }, obj);
}


};

Ops.Json.ObjectGetArrayValuesByPath.prototype = new CABLES.Op();
CABLES.OPS["609a645e-5e24-4a5e-a379-804c5b64f5d5"]={f:Ops.Json.ObjectGetArrayValuesByPath,objName:"Ops.Json.ObjectGetArrayValuesByPath"};




// **************************************************************
// 
// Ops.Sidebar.SideBarSwitch
// 
// **************************************************************

Ops.Sidebar.SideBarSwitch = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const parentPort = op.inObject("link"),
    inArr = op.inArray("Names"),
    inStyle = op.inSwitch("Style", ["Tabs", "Switch"], "Switch"),
    labelPort = op.inString("Text", "Switch"),

    inInput = op.inInt("Input", 0),

    setDefaultValueButtonPort = op.inTriggerButton("Set Default"),
    inGreyOut = op.inBool("Grey Out", false),

    inDefault = op.inValue("Default", 0),

    siblingsPort = op.outObject("childs"),
    outIndex = op.outNumber("Index", -1),
    outStr = op.outString("String");

let elTabActive = null;
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.dataset.op = op.id;
el.classList.add("cablesEle");
inDefault.setUiAttribs({ "greyout": true });

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const switchGroup = document.createElement("div");
el.appendChild(switchGroup);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");
op.setPortGroup("Default Item", [inDefault, setDefaultValueButtonPort]);
const tabEles = [];

inArr.onChange = rebuildHtml;
inStyle.onChange = updateStyle;
updateStyle();

labelPort.onChange = () =>
{
    label.innerHTML = labelPort.get();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

function rebuildHtml()
{
    tabEles.length = 0;
    switchGroup.innerHTML = "";
    elTabActive = null;

    const arr = inArr.get();
    if (!arr) return;

    for (let i = 0; i < arr.length; i++)
    {
        const el = addTab(String(arr[i]));
        if (i == inDefault.get())setActiveTab(el);
    }
}

setDefaultValueButtonPort.onTriggered = () =>
{
    inDefault.set(outIndex.get());
    op.refreshParams();
};

function updateStyle()
{
    if (inStyle.get() == "Tabs")
    {
        el.classList.add("sidebar_tabs");
        switchGroup.classList.remove("sidebar_switchs");
        label.style.display = "none";
    }
    else
    {
        el.classList.remove("sidebar_tabs");
        switchGroup.classList.add("sidebar_switchs");
        label.style.display = "inline-block";
    }

    labelPort.setUiAttribs({ "greyout": inStyle.get() == "Tabs" });

    rebuildHtml();
}

function addTab(title)
{
    const tabEle = document.createElement("div");

    if (inStyle.get() == "Tabs") tabEle.classList.add("sidebar_tab");
    else tabEle.classList.add("sidebar_switch");

    tabEle.id = "tabEle" + tabEles.length;
    tabEle.innerHTML = title;
    tabEle.dataset.index = tabEles.length;
    tabEle.dataset.txt = title;

    tabEle.addEventListener("click", tabClicked);

    switchGroup.appendChild(tabEle);

    tabEles.push(tabEle);

    return tabEle;
}

inInput.onChange = () =>
{
    if (tabEles.length > inInput.get())
        tabClicked({ "target": tabEles[inInput.get()] });
    // setActiveTab(tabEles[inInput.get()]);
};

function setActiveTab(el)
{
    if (el)
    {
        elTabActive = el;
        op.log(el.dataset.index);
        outIndex.set(parseInt(el.dataset.index));
        outStr.set(el.dataset.txt);

        if (inStyle.get() == "Tabs") el.classList.add("sidebar_tab_active");
        else el.classList.add("sidebar_switch_active");
    }
}

function tabClicked(e)
{
    if (elTabActive)
        if (inStyle.get() == "Tabs") elTabActive.classList.remove("sidebar_tab_active");
        else elTabActive.classList.remove("sidebar_switch_active");
    setActiveTab(e.target);
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    {
        if (el.parentElement)
            el.parentElement.removeChild(el);
    }
}

function showElement(el)
{
    if (!el) return;
    el.style.display = "block";
}

function hideElement(el)
{
    if (!el) return;
    el.style.display = "none";
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.Sidebar.SideBarSwitch.prototype = new CABLES.Op();
CABLES.OPS["ebc8c92c-5fa6-4598-a9c6-b8e12f22f7c2"]={f:Ops.Sidebar.SideBarSwitch,objName:"Ops.Sidebar.SideBarSwitch"};




// **************************************************************
// 
// Ops.User.rambodc.ArrayToObject
// 
// **************************************************************

Ops.User.rambodc.ArrayToObject = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const arrayIn = op.inArray("Array");
const resultOut = op.outObject("Output");

arrayIn.onChange = update;

function update()
{
    const data = arrayIn.get();

    if (data && Array.isArray(data))
    {
        let result = {};

        data.forEach((value, index) => {
            result[index] = value;
        });

        resultOut.set(result);
    }
    else
    {
        resultOut.set({});
    }
}


};

Ops.User.rambodc.ArrayToObject.prototype = new CABLES.Op();
CABLES.OPS["a1b515eb-4063-4fe7-a92f-ef3a3f63f289"]={f:Ops.User.rambodc.ArrayToObject,objName:"Ops.User.rambodc.ArrayToObject"};




// **************************************************************
// 
// Ops.User.rambodc.BeautifyJson
// 
// **************************************************************

Ops.User.rambodc.BeautifyJson = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inObj = op.inObject("Object"),
    outString = op.outString("Result"),
    outError = op.outBoolNum("Error");

inObj.onChange = update;

function update()
{
    try
    {
        let obj = inObj.get();
        if (!obj) {
            outString.set("");
            return;
        }
        let result = '';
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                let value = obj[key];
                // Capitalize the first letter of key and value (if it's a string)
                let formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
                let formattedValue = typeof value === 'string' ? (value.charAt(0).toUpperCase() + value.slice(1)) : JSON.stringify(value, null, 4);
                // Format the key-value pair and add it to the result string
                // Replacing \n with <br />
                result += `<b>${formattedKey}</b>: ${formattedValue.replace(/\n/g, '<br />')}<br />`;
            }
        }
        outString.set(result);
        outError.set(0);
    }
    catch (e)
    {
        op.error(e);
        outString.set("error");
        outError.set(1);
    }
}


};

Ops.User.rambodc.BeautifyJson.prototype = new CABLES.Op();
CABLES.OPS["f0c8e4de-8900-47a1-bc8c-407370907128"]={f:Ops.User.rambodc.BeautifyJson,objName:"Ops.User.rambodc.BeautifyJson"};




// **************************************************************
// 
// Ops.Trigger.TriggerNumber
// 
// **************************************************************

Ops.Trigger.TriggerNumber = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe0 = op.inTriggerButton("0"),
    exe1 = op.inTriggerButton("1"),
    exe2 = op.inTriggerButton("2"),
    exe3 = op.inTriggerButton("3"),
    exe4 = op.inTriggerButton("4"),
    exe5 = op.inTriggerButton("5"),
    exe6 = op.inTriggerButton("6"),
    exe7 = op.inTriggerButton("7"),
    number = op.outNumber("number");

number.changeAlways = true;
const outTrig = op.outTrigger("Triggered");

exe0.onTriggered = function () { number.set(0); outTrig.trigger(); };
exe1.onTriggered = function () { number.set(1); outTrig.trigger(); };
exe2.onTriggered = function () { number.set(2); outTrig.trigger(); };
exe3.onTriggered = function () { number.set(3); outTrig.trigger(); };
exe4.onTriggered = function () { number.set(4); outTrig.trigger(); };
exe5.onTriggered = function () { number.set(5); outTrig.trigger(); };
exe6.onTriggered = function () { number.set(6); outTrig.trigger(); };
exe7.onTriggered = function () { number.set(7); outTrig.trigger(); };


};

Ops.Trigger.TriggerNumber.prototype = new CABLES.Op();
CABLES.OPS["43ed1123-1312-4383-b843-27b8ec540c09"]={f:Ops.Trigger.TriggerNumber,objName:"Ops.Trigger.TriggerNumber"};




// **************************************************************
// 
// Ops.Math.Compare.Equals
// 
// **************************************************************

Ops.Math.Compare.Equals = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    number1 = op.inValue("number1", 1),
    number2 = op.inValue("number2", 1),
    result = op.outBoolNum("result");

number1.onChange =
    number2.onChange = exec;
exec();

function exec()
{
    result.set(number1.get() == number2.get());
}


};

Ops.Math.Compare.Equals.prototype = new CABLES.Op();
CABLES.OPS["4dd3cc55-eebc-4187-9d4e-2e053a956fab"]={f:Ops.Math.Compare.Equals,objName:"Ops.Math.Compare.Equals"};




// **************************************************************
// 
// Ops.User.rambodc.Button_Suggestions
// 
// **************************************************************

Ops.User.rambodc.Button_Suggestions = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("div");
input.classList.add("sidebar__button-input-suggestions");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_Suggestions.prototype = new CABLES.Op();
CABLES.OPS["c4d714cf-6b8e-4034-8956-b322ca77ef89"]={f:Ops.User.rambodc.Button_Suggestions,objName:"Ops.User.rambodc.Button_Suggestions"};




// **************************************************************
// 
// Ops.User.rambodc.Button_Gray
// 
// **************************************************************

Ops.User.rambodc.Button_Gray = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("div");
input.classList.add("sidebar__button-input-gray");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_Gray.prototype = new CABLES.Op();
CABLES.OPS["ff2092f0-e117-4bb7-9750-d2a60dd89814"]={f:Ops.User.rambodc.Button_Gray,objName:"Ops.User.rambodc.Button_Gray"};




// **************************************************************
// 
// Ops.Boolean.TriggerBoolean
// 
// **************************************************************

Ops.Boolean.TriggerBoolean = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inTriggerTrue = op.inTriggerButton("True"),
    inTriggerFalse = op.inTriggerButton("false"),
    outResult = op.outBoolNum("Result");

inTriggerTrue.onTriggered = function ()
{
    outResult.set(true);
};

inTriggerFalse.onTriggered = function ()
{
    outResult.set(false);
};


};

Ops.Boolean.TriggerBoolean.prototype = new CABLES.Op();
CABLES.OPS["31f65abe-9d6c-4ba6-a291-ef2de41d2087"]={f:Ops.Boolean.TriggerBoolean,objName:"Ops.Boolean.TriggerBoolean"};




// **************************************************************
// 
// Ops.Boolean.Not
// 
// **************************************************************

Ops.Boolean.Not = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    bool = op.inValueBool("Boolean"),
    outbool = op.outBoolNum("Result");

bool.changeAlways = true;

bool.onChange = function ()
{
    outbool.set((!bool.get()));
};


};

Ops.Boolean.Not.prototype = new CABLES.Op();
CABLES.OPS["6d123c9f-7485-4fd9-a5c2-76e59dcbeb34"]={f:Ops.Boolean.Not,objName:"Ops.Boolean.Not"};




// **************************************************************
// 
// Ops.User.rambodc.Button_Orange
// 
// **************************************************************

Ops.User.rambodc.Button_Orange = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("div");
input.classList.add("sidebar__button-input-orange");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_Orange.prototype = new CABLES.Op();
CABLES.OPS["60ea13be-c3ef-46c3-b226-08657b8074fb"]={f:Ops.User.rambodc.Button_Orange,objName:"Ops.User.rambodc.Button_Orange"};




// **************************************************************
// 
// Ops.User.rambodc.TextInput_Field
// 
// **************************************************************

Ops.User.rambodc.TextInput_Field = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    parentPort = op.inObject("Link"),
    labelPort = op.inString("Text", "Text"),
    defaultValuePort = op.inString("Default", ""),
    inPlaceholder = op.inString("Placeholder", ""),
    inType = op.inSwitch("Type", ["text", "password"], "text"),
    inTextArea = op.inBool("TextArea", false),
    inGreyOut = op.inBool("Grey Out", false),
    inVisible = op.inBool("Visible", true),
    inClear = op.inTriggerButton("Clear"),
    siblingsPort = op.outObject("Children"),
    valuePort = op.outString("Result", defaultValuePort.get()),
    outFocus = op.outBool("Focus");

const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text-input");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

label.addEventListener("dblclick", function ()
{
    valuePort.set(defaultValuePort.get());
    input.value = defaultValuePort.get();
});

let input = null;
creatElement();

op.toWorkPortsNeedToBeLinked(parentPort);

inTextArea.onChange = creatElement;
inType.onChange = setAttribs;

function setAttribs()
{
    input.setAttribute("type", inType.get());
    input.setAttribute("value", defaultValuePort.get());
    input.setAttribute("placeholder", inPlaceholder.get());
}

function creatElement()
{
    if (input)input.remove();
    if (!inTextArea.get())
    {
        input = document.createElement("input");
    }
    else
    {
        input = document.createElement("textarea");
        onDefaultValueChanged();
    }

    input.classList.add("sidebar__text-input-input-field");

    setAttribs();

    el.appendChild(input);
    input.addEventListener("input", onInput);
    input.addEventListener("focus", onFocus);
    input.addEventListener("blur", onBlur);
}

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inClear.onTriggered = () =>
{
    input.value = "";
};

function onFocus()
{
    outFocus.set(true);
}

function onBlur()
{
    outFocus.set(false);
}

inPlaceholder.onChange = () =>
{
    input.setAttribute("placeholder", inPlaceholder.get());
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;

// functions

function onInput(ev)
{
    valuePort.set(ev.target.value);
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI)
    {
        op.setTitle("Text Input: " + labelText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

inClear.onTriggered = () => {
  input.value = "";
  valuePort.set("");
};


};

Ops.User.rambodc.TextInput_Field.prototype = new CABLES.Op();
CABLES.OPS["a67dcecb-1ede-425c-9767-036b17e27130"]={f:Ops.User.rambodc.TextInput_Field,objName:"Ops.User.rambodc.TextInput_Field"};




// **************************************************************
// 
// Ops.String.StringTrim_v2
// 
// **************************************************************

Ops.String.StringTrim_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inStr=op.inString("String"),
    outStr=op.outString("Result",'');

inStr.onChange=function()
{
    if(!inStr.get())outStr.set('');
        else outStr.set(inStr.get().trim());
};


};

Ops.String.StringTrim_v2.prototype = new CABLES.Op();
CABLES.OPS["a9aed302-328a-4d33-bd3f-27e3e6690b9e"]={f:Ops.String.StringTrim_v2,objName:"Ops.String.StringTrim_v2"};




// **************************************************************
// 
// Ops.Trigger.TriggerSend
// 
// **************************************************************

Ops.Trigger.TriggerSend = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const trigger = op.inTriggerButton("Trigger");
op.varName = op.inValueSelect("Named Trigger", [], "", true);

op.varName.onChange = updateName;

trigger.onTriggered = doTrigger;

op.patch.addEventListener("namedTriggersChanged", updateVarNamesDropdown);

updateVarNamesDropdown();

function updateVarNamesDropdown()
{
    if (CABLES.UI)
    {
        const varnames = [];
        const vars = op.patch.namedTriggers;
        varnames.push("+ create new one");
        for (const i in vars) varnames.push(i);
        op.varName.uiAttribs.values = varnames;
    }
}

function updateName()
{
    if (CABLES.UI)
    {
        if (op.varName.get() == "+ create new one")
        {
            new CABLES.UI.ModalDialog({
                "prompt": true,
                "title": "New Trigger",
                "text": "Enter a name for the new trigger",
                "promptValue": "",
                "promptOk": (str) =>
                {
                    op.varName.set(str);
                    op.patch.namedTriggers[str] = op.patch.namedTriggers[str] || [];
                    updateVarNamesDropdown();
                }
            });
            return;
        }

        op.refreshParams();
    }

    if (!op.patch.namedTriggers[op.varName.get()])
    {
        op.patch.namedTriggers[op.varName.get()] = op.patch.namedTriggers[op.varName.get()] || [];
        op.patch.emitEvent("namedTriggersChanged");
    }

    op.setTitle(">" + op.varName.get());

    op.refreshParams();
    op.patch.emitEvent("opTriggerNameChanged", op, op.varName.get());
}

function doTrigger()
{
    const arr = op.patch.namedTriggers[op.varName.get()];
    // fire an event even if noone is receiving this trigger
    // this way TriggerReceiveFilter can still handle it
    op.patch.emitEvent("namedTriggerSent", op.varName.get());

    if (!arr)
    {
        op.setUiError("unknowntrigger", "unknown trigger");
        return;
    }
    else op.setUiError("unknowntrigger", null);

    for (let i = 0; i < arr.length; i++)
    {
        arr[i]();
    }
}


};

Ops.Trigger.TriggerSend.prototype = new CABLES.Op();
CABLES.OPS["ce1eaf2b-943b-4dc0-ab5e-ee11b63c9ed0"]={f:Ops.Trigger.TriggerSend,objName:"Ops.Trigger.TriggerSend"};




// **************************************************************
// 
// Ops.User.rambodc.SidebarText_v2
// 
// **************************************************************

Ops.User.rambodc.SidebarText_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");  // new input trigger "Clear"
const inVisible = op.inBool("Visible", true);  // new input for visibility

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
const label = document.createElement("div");
label.classList.add("sidebar__item-label-v2");
const labelText = document.createElement("div");// document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;  // new event handler for "Clear" trigger
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;  // new event handler for visibility change

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// functions

function onVisibilityChanged() {  // new function to handle visibility change
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() { // new function to handle "Clear" trigger
    labelPort.set(''); // clear the "Text" input
    onLabelTextChanged(); // update label text
}

function onIdChanged()
{
    el.id = inId.get();
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.innerHTML = labelText;
    if (CABLES.UI)
    {
        if (labelText && typeof labelText === "string")
        {
            op.setTitle("Text: " + labelText.substring(0, 10)); // display first 10 characters of text in op title
        }
        else
        {
            op.setTitle("Text");
        }
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

//


};

Ops.User.rambodc.SidebarText_v2.prototype = new CABLES.Op();
CABLES.OPS["c2b67e03-b659-4a5c-ae9e-ec842962532c"]={f:Ops.User.rambodc.SidebarText_v2,objName:"Ops.User.rambodc.SidebarText_v2"};




// **************************************************************
// 
// Ops.Extension.ECharts.ECharts
// 
// **************************************************************

Ops.Extension.ECharts.ECharts = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// I/O

const createChartTrig = op.inTriggerButton("Create");
const inParent = op.inObject("Parent DOM element");
const inId = op.inString("Id");
const inWidth = op.inInt("Width", 640);
const inHeight = op.inInt("Height", 480);
const chartOpts = op.inObject("Chart Object");
const mergeOpts = op.inObject("Merge options");
const rendererSel = op.inSwitch("Renderer", ["canvas", "svg"], "canvas");
const themeSelect = op.inSwitch("Theme", ["default", "light", "dark"], "dark");
const customTheme = op.inObject("Custom theme obj");
const inInitExtraOpts = op.inObject("Init extra Options");
const inStyle = op.inValueEditor("Style", "position:absolute;\nz-index:100;\nbackground:white;", "inline-css");
const inVisible = op.inValueBool("Visible", true);

const outElement = op.outObject("DOM Element");
const outChart = op.outObject("ECharts instance");
const outChartUpdated = op.outTrigger("Chart updated");
const outThemeTrig = op.outTrigger("Theme changed");

const DEFAULT_THEME = 0;
const DARK_THEME = 1;
const CUSTOM_THEME = 2;

let loaded = false;

// Core variables
const div = document.createElement("div");
div.dataset.op = op.id;

const canvas = op.patch.cgl.canvas.parentElement;
let chart = null;
let prevDisplay = "block";

// Function binding
op.onDelete = removeElement;

inParent.onChange = appendChartDiv;
inStyle.onChange = updateStyle;
inVisible.onChange = updateVisibility;
inId.onChange = updateId;
inWidth.onChange = resize;
inHeight.onChange = resize;
chartOpts.onChange = updateChart;
mergeOpts.onChange = updateChart;
themeSelect.onChange = changeTheme;
customTheme.onChange = changeTheme;
rendererSel.onChange = changeRenderer;

// // Functions implementation

function isValidObj(obj)
{
    if (obj && typeof obj === "object" && obj !== 0 && obj !== null)
        return true;
    return false;
}

function main()
{
    appendChartDiv();
    updateStyle();

    loaded = true;
    initChart();
    resize();

    outChart.set(chart);
    outThemeTrig.trigger();
    outChartUpdated.trigger();
}

function initChart()
{
    if (!loaded) return;

    if (chart)
    {
        chart.dispose();
        chart = null;
    }

    let theme = customTheme.get();
    if (!theme)
    {
        theme = themeSelect.get();
    }

    let extra = inInitExtraOpts.get();
    if (!isValidObj(extra))
    {
        const rend = rendererSel.get();
        extra = {
            "renderer": rend
        };
    }

    chart = echarts.init(div, theme, extra);
    setChartOptions();
}

function changeRenderer()
{
    initChart();
    outChart.set(chart);
    outChartUpdated.trigger();
}

function changeTheme()
{
    initChart();
    outChart.set(chart);
    outThemeTrig.trigger();
    outChartUpdated.trigger();
}

function appendChartDiv()
{
    const p = inParent.get();
    if (!p)
    {
        canvas.append(div);
    }
    else
    {
        p.append(div);
    }
}

function setChartOptions()
{
    // https://echarts.apache.org/en/api.html#echartsInstance.setOption
    const opts = chartOpts.get();
    const merge = mergeOpts.get();

    if (!chart) return;

    if (isValidObj(opts))
    {
        if (isValidObj(merge))
        {
            chart.setOption(opts, merge);
        }
        else
        {
            chart.setOption(opts, false, true);
        }
    }
}

function updateChart()
{
    setChartOptions();
    outChartUpdated.trigger();
}

function resize()
{
    const w = Math.max(0, inWidth.get());
    const h = Math.max(0, inHeight.get());

    updateStyle();

    if (chart)
        chart.resize(w, h);
}

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = prevDisplay;
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateId()
{
    div.id = inId.get();
}

function updateStyle()
{
    const w = Math.max(0, inWidth.get());
    const h = Math.max(0, inHeight.get());

    let s = inStyle.get();

    if (w > 0)
    {
        s += "width:" + w + "px;";
    }
    if (h > 0)
    {
        s += "height:" + h + "px;";
    }

    if (s != div.style)
    {
        div.setAttribute("style", s);
        updateVisibility();
        outElement.set(null);
        outElement.set(div);
    }

    if (!div.parentElement)
    {
        canvas.appendChild(div);
    }
}

function removeElement()
{
    if (chart) chart.dispose();
    if (div) div.remove();
}

createChartTrig.onTriggered = main;


};

Ops.Extension.ECharts.ECharts.prototype = new CABLES.Op();
CABLES.OPS["576db162-78fc-422d-86df-0d4a4e66a44e"]={f:Ops.Extension.ECharts.ECharts,objName:"Ops.Extension.ECharts.ECharts"};




// **************************************************************
// 
// Ops.Html.CSSPropertyString
// 
// **************************************************************

Ops.Html.CSSPropertyString = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inEle = op.inObject("Element"),
    inProperty = op.inString("Property"),
    inValue = op.inString("Value"),
    outEle = op.outObject("HTML Element");

op.setPortGroup("Element", [inEle]);
op.setPortGroup("Attributes", [inProperty, inValue]);

inProperty.onChange = updateProperty;
inValue.onChange = update;
let ele = null;

inEle.onChange =
outEle.onLinkChanged =
inEle.onLinkChanged = function ()
{
    if (ele && ele.style) ele.style[inProperty.get()] = "initial";
    update();
};

function updateProperty()
{
    update();
    op.setUiAttrib({ "extendTitle": inProperty.get() + "" });
}

function update()
{
    ele = inEle.get();
    if (ele && ele.style)
    {
        const str = inValue.get();
        try
        {
            ele.style[inProperty.get()] = str;
        }
        catch (e)
        {
            op.logError(e);
        }
    }

    outEle.set(inEle.get());
}


};

Ops.Html.CSSPropertyString.prototype = new CABLES.Op();
CABLES.OPS["a7abdfb9-4c2a-4ddb-8fc6-55b3fdfbdaf3"]={f:Ops.Html.CSSPropertyString,objName:"Ops.Html.CSSPropertyString"};




// **************************************************************
// 
// Ops.Trigger.IsTriggered
// 
// **************************************************************

Ops.Trigger.IsTriggered = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exec = op.inTrigger("Trigger"),
    next = op.outTrigger("Next"),
    result = op.outBoolNum("Was Triggered", false);

let frameCount = 0;

op.onAnimFrame = function (tt)
{
    frameCount++;
    if (frameCount > 1) result.set(false);
};

exec.onTriggered = function ()
{
    frameCount = 0;
    result.set(true);
    next.trigger();
};


};

Ops.Trigger.IsTriggered.prototype = new CABLES.Op();
CABLES.OPS["7c96fee9-4c2f-45e1-a41b-096b06d286b8"]={f:Ops.Trigger.IsTriggered,objName:"Ops.Trigger.IsTriggered"};




// **************************************************************
// 
// Ops.User.rambodc.List1
// 
// **************************************************************

Ops.User.rambodc.List1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs
const parentPort = op.inObject("link");
const buttonsJsonPort = op.inObject("Buttons JSON");
const buttonKeyValue = op.inString("Button Key", "button1");
const buttonIconUrl = op.inString("Icon", "");

// Outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");
const buttonIndexPort = op.outValue("Button Index");
const buttonObjectPort = op.outObject("Button Object");
const editButtonPressedPort = op.outTrigger("Edit Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// Variables
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");

let buttons = [];
let reversedKeys = [];

function getNestedProperty(obj, key) {
    return key.split(".").reduce(function(o, x) {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
}

function initializeButtons() {
    buttons.forEach((button) => el.removeChild(button));
    buttons = [];

    const buttonsJson = buttonsJsonPort.get();
    if (!buttonsJson) return;

    const keys = Object.keys(buttonsJson).reverse();
    reversedKeys = keys;

    keys.forEach((key, index) => {
        const button = document.createElement("div");
        button.classList.add("sidebar__button-input-list");
        button.dataset.expanded = "false";
        button.addEventListener("click", () => onButtonClick(index, button));

        const iconUrl = buttonIconUrl.get();
        if(iconUrl) {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.style.marginRight = '10px';
            img.width = 20; // set width to 20px
            img.height = 20; // set height to 20px
            button.appendChild(img);
        }

        const inputText = document.createTextNode(getNestedProperty(buttonsJson[key], buttonKeyValue.get()));
        button.appendChild(inputText);

        el.appendChild(button);
        buttons.push(button);
    });
}

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

parentPort.onChange = onParentChanged;
buttonsJsonPort.onChange = initializeButtons;
buttonKeyValue.onChange = initializeButtons;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function() {
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function() {
    el.style.display = inVisible.get() ? "block" : "none";
};

function formatJsonObject(obj) {
    if (!obj) return "";
    let result = "";
    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let value = obj[key];
            let formattedKey = key.charAt(0).toUpperCase() + key.slice(1);
            let formattedValue = typeof value === "string" ? (value.charAt(0).toUpperCase() + value.slice(1)) : JSON.stringify(value, null, 4);
            result += `<b>${formattedKey}</b>: ${formattedValue.replace(/\n/g, "<br />")}<br />`;
        }
    }
    return result;
}

function onButtonClick(index, button) {
    buttonPressedPort.trigger();
    buttonIndexPort.set(index);
    let buttonObject = buttonsJsonPort.get()[reversedKeys[index]];
    buttonObjectPort.set(buttonObject);

    if (button.dataset.expanded === "false") {
        const pre = document.createElement("pre");
        pre.style.whiteSpace = "pre-wrap";
        pre.innerHTML = formatJsonObject(buttonObject);

        const editText = document.createElement("a");
        editText.textContent = "Options";
        editText.href = "#";
        editText.style.display = "block";
        editText.style.cursor = "pointer";
        editText.style.color = "#007bff";
        editText.style.textDecoration = "none";

        editText.onmouseover = function() {
            this.style.textDecoration = "underline";
            this.style.fontWeight = "bold";
        };

        editText.onmouseout = function() {
            this.style.textDecoration = "none";
            this.style.fontWeight = "normal";
        };

        editText.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            editButtonPressedPort.trigger();
        });

        button.innerHTML = "";

        const iconUrl = buttonIconUrl.get();
        if(iconUrl) {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.style.marginRight = '10px';
            img.width = 20; // set width to 20px
            img.height = 20; // set height to 20px
            button.appendChild(img);
        }

        button.appendChild(pre);
        button.appendChild(editText);

        button.dataset.expanded = "true";
    } else {
        button.innerHTML = "";

        const iconUrl = buttonIconUrl.get();
        if(iconUrl) {
            const img = document.createElement('img');
            img.src = iconUrl;
            img.style.marginRight = '10px';
            img.width = 20; // set width to 20px
            img.height = 20; // set height to 20px
            button.appendChild(img);
        }

        const inputText = document.createTextNode(getNestedProperty(buttonObject, buttonKeyValue.get()));
        button.appendChild(inputText);
        button.dataset.expanded = "false";
    }
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete() {
    buttons.forEach((button) => removeElementFromDOM(button));
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}

initializeButtons();


};

Ops.User.rambodc.List1.prototype = new CABLES.Op();
CABLES.OPS["d63c8a6d-f4bd-44b5-93ca-10abd6dc1372"]={f:Ops.User.rambodc.List1,objName:"Ops.User.rambodc.List1"};




// **************************************************************
// 
// Ops.User.rambodc.Button_Refresh
// 
// **************************************************************

Ops.User.rambodc.Button_Refresh = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("div");
input.classList.add("sidebar__button-input-refresh");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_Refresh.prototype = new CABLES.Op();
CABLES.OPS["f354fe3b-fa05-4882-a3d2-192b3c27b01e"]={f:Ops.User.rambodc.Button_Refresh,objName:"Ops.User.rambodc.Button_Refresh"};




// **************************************************************
// 
// Ops.Devices.Keyboard.KeyPressLearn
// 
// **************************************************************

Ops.Devices.Keyboard.KeyPressLearn = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const learnedKeyCode = op.inValueInt("key code");
const canvasOnly = op.inValueBool("canvas only", true);
const modKey = op.inValueSelect("Mod Key", ["none", "alt"], "none");
const inEnable = op.inValueBool("Enabled", true);
const preventDefault = op.inValueBool("Prevent Default");
const learn = op.inTriggerButton("learn");
const onPress = op.outTrigger("on press");
const onRelease = op.outTrigger("on release");
const outPressed = op.outBoolNum("Pressed", false);
const outKey = op.outString("Key");

const cgl = op.patch.cgl;
let learning = false;

modKey.onChange = learnedKeyCode.onChange = updateKeyName;

function onKeyDown(e)
{
    if (learning)
    {
        learnedKeyCode.set(e.keyCode);
        if (CABLES.UI)
        {
            op.refreshParams();
        }
        // op.log("Learned key code: " + learnedKeyCode.get());
        learning = false;
        removeListeners();
        addListener();

        if (CABLES.UI)gui.emitEvent("portValueEdited", op, learnedKeyCode, learnedKeyCode.get());
    }
    else
    {
        if (e.keyCode == learnedKeyCode.get())
        {
            if (modKey.get() == "alt")
            {
                if (e.altKey === true)
                {
                    onPress.trigger();
                    outPressed.set(true);
                    if (preventDefault.get())e.preventDefault();
                }
            }
            else
            {
                onPress.trigger();
                outPressed.set(true);
                if (preventDefault.get())e.preventDefault();
            }
        }
    }
}

function onKeyUp(e)
{
    if (e.keyCode == learnedKeyCode.get())
    {
        // op.log("Key released, key code: " + e.keyCode);
        onRelease.trigger();
        outPressed.set(false);
    }
}

op.onDelete = function ()
{
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    document.removeEventListener("keydown", onKeyDown, false);
};

learn.onTriggered = function ()
{
    // op.log("Listening for key...");
    learning = true;
    addDocumentListener();

    setTimeout(function ()
    {
        learning = false;
        removeListeners();
        addListener();
    }, 3000);
};

function addListener()
{
    if (canvasOnly.get()) addCanvasListener();
    else addDocumentListener();
}

function removeListeners()
{
    document.removeEventListener("keydown", onKeyDown, false);
    document.removeEventListener("keyup", onKeyUp, false);
    cgl.canvas.removeEventListener("keydown", onKeyDown, false);
    cgl.canvas.removeEventListener("keyup", onKeyUp, false);
    outPressed.set(false);
}

function addCanvasListener()
{
    if (!CABLES.UTILS.isNumeric(cgl.canvas.getAttribute("tabindex"))) cgl.canvas.setAttribute("tabindex", 1);

    cgl.canvas.addEventListener("keydown", onKeyDown, false);
    cgl.canvas.addEventListener("keyup", onKeyUp, false);
}

function addDocumentListener()
{
    document.addEventListener("keydown", onKeyDown, false);
    document.addEventListener("keyup", onKeyUp, false);
}

inEnable.onChange = function ()
{
    if (!inEnable.get())
    {
        removeListeners();
    }
    else
    {
        addListener();
    }
};

canvasOnly.onChange = function ()
{
    removeListeners();
    addListener();
};

function updateKeyName()
{
    let keyName = CABLES.keyCodeToName(learnedKeyCode.get());
    const modKeyName = modKey.get();
    if (modKeyName && modKeyName !== "none")
    {
        keyName = modKeyName.charAt(0).toUpperCase() + modKeyName.slice(1) + "-" + keyName;
    }
    op.setUiAttribs({ "extendTitle": keyName });
    outKey.set(keyName);
}

addCanvasListener();


};

Ops.Devices.Keyboard.KeyPressLearn.prototype = new CABLES.Op();
CABLES.OPS["f069c0db-4051-4eae-989e-6ef7953787fd"]={f:Ops.Devices.Keyboard.KeyPressLearn,objName:"Ops.Devices.Keyboard.KeyPressLearn"};




// **************************************************************
// 
// Ops.Extension.ECharts.EChartsEvent
// 
// **************************************************************

Ops.Extension.ECharts.EChartsEvent = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const inChart = op.inObject("ECharts instance");
const evtName = op.inString("Event name");
const queryStr = op.inString("Query string");
const queryObj = op.inObject("Query object");
const inExecute = op.inTriggerButton("Refresh event binding");

const outChart = op.outObject("Out Chart");
const outTrigger = op.outTrigger("Trigger");
const outEvent = op.outObject("Event params");
const outDirty = op.outBool("Dirty (needs rebind)");

op.onDelete = removeEvent;
inExecute.onTriggered = main;
evtName.onChange = queryStr.onChange = queryObj.onChange = setIsDirty;
inChart.onChange = chartChanged;

let chart = null;
let eventName = null;

function chartChanged()
{
    if (!inChart.isLinked())
    {
        removeEvent();
        setIsDirty();
        return;
    }
    addEvent();
}

function setIsDirty()
{
    setDirty(true);
}

function setDirty(v)
{
    outDirty.set(null);
    outDirty.set(v);
}

function removeEvent()
{
    if (chart && eventName)
    {
        chart.off(eventName);
        chart = null;
    }
}

function addEvent()
{
    const newChart = inChart.get();
    if (!newChart)
    {
        removeEvent();
        setDirty(true);
        outChart.set(null);
        return;
    }

    if (newChart == chart)
    {
        // same reference
        // do nothing, event is already bound
        return;
    }

    chart = newChart;

    try
    {
        eventName = evtName.get();
        let q = queryObj.get();
        if (!q)
        {
            // if we don't use the query obj
            q = queryStr.get();
        }

        //  bind actual event
        chart.on(eventName, q, (e) =>
        {
            // Delete to remove circular parsing in Cables
            delete e.$vars;
            delete e.event.event;
            delete e.event.target;
            delete e.event.topTarget;

            outEvent.set(e);

            outTrigger.trigger();
        });

        // remove error message if any
        op.setUiError("error", null);
        setDirty(false);
        outChart.set(chart);
    }
    catch (error)
    {
        setDirty(true);
        chart = null;
        const errorMsg = error + " - check if input is ECharts instance";
        op.setUiError("error", errorMsg);
        outChart.set(null);
    }
}

function main()
{
    removeEvent();
    addEvent();
}


};

Ops.Extension.ECharts.EChartsEvent.prototype = new CABLES.Op();
CABLES.OPS["70116802-623a-461b-8aad-59aaa3bd9d3c"]={f:Ops.Extension.ECharts.EChartsEvent,objName:"Ops.Extension.ECharts.EChartsEvent"};




// **************************************************************
// 
// Ops.User.rambodc.SidebarText_2
// 
// **************************************************************

Ops.User.rambodc.SidebarText_2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");
const inVisible = op.inBool("Visible", true);

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");

const label = document.createElement("div");
label.classList.add("sidebar__item-label-v2");
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

function onVisibilityChanged() {
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() {
    labelPort.set('');
    onLabelTextChanged();
}

function onIdChanged() {
    el.id = inId.get();
}

function onLabelTextChanged() {
    let labelText = labelPort.get();

    if(labelText) {
        labelText = labelText.replace(/\n/g, '<br/>');
    } else {
        labelText = "";
    }

    label.innerHTML = labelText;

    if (CABLES.UI) {
        if (labelText && typeof labelText === "string") {
            op.setTitle("Text: " + labelText.substring(0, 10));
        } else {
            op.setTitle("Text");
        }
    }
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.SidebarText_2.prototype = new CABLES.Op();
CABLES.OPS["2d85577d-68a0-4f43-a840-29b538071eb2"]={f:Ops.User.rambodc.SidebarText_2,objName:"Ops.User.rambodc.SidebarText_2"};




// **************************************************************
// 
// Ops.User.rambodc.AjaxRequest1
// 
// **************************************************************

Ops.User.rambodc.AjaxRequest1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const filename = op.inUrl("file"),
    jsonp = op.inValueBool("JsonP", false),
    headers = op.inObject("headers", {}),
    inBody = op.inStringEditor("body", ""),
    inMethod = op.inDropDown("HTTP Method", ["GET", "POST", "PUT", "DELETE", "PATCH", "HEAD", "CONNECT", "OPTIONS", "TRACE"], "GET"),
    inContentType = op.inString("Content-Type", "application/json"),
    inParseJson = op.inBool("parse json", true),
    inAutoRequest = op.inBool("Auto request", false),
    reloadTrigger = op.inTriggerButton("reload"),
    outData = op.outObject("data"),
    outString = op.outString("response"),
    isLoading = op.outBoolNum("Is Loading", false),
    outTrigger = op.outTrigger("Loaded"),
    outSuccess = op.outTrigger("Success"), // success trigger
    outFailed = op.outTrigger("Failed"); // failed trigger

filename.setUiAttribs({ "title": "URL" });
reloadTrigger.setUiAttribs({ "buttonTitle": "trigger request" });

outData.ignoreValueSerialize = true;
outString.ignoreValueSerialize = true;

inAutoRequest.onChange = filename.onChange = jsonp.onChange = headers.onChange = inMethod.onChange = inParseJson.onChange = function ()
{
    delayedReload(false);
};

reloadTrigger.onTriggered = function ()
{
    delayedReload(true);
};

let loadingId = 0;
let reloadTimeout = 0;

function delayedReload(force = false)
{
    clearTimeout(reloadTimeout);
    reloadTimeout = setTimeout(function () { reload(null, force); }, 100);
}

op.onFileChanged = function (fn)
{
    if (filename.get() && filename.get().indexOf(fn) > -1) reload(true);
};

function reload(addCachebuster, force = false)
{
    if (!inAutoRequest.get() && !force) return;
    if (!filename.get()) return;

    op.patch.loading.finished(loadingId);

    loadingId = op.patch.loading.start("jsonFile", "" + filename.get());
    isLoading.set(true);

    op.setUiAttrib({ "extendTitle": CABLES.basename(filename.get()) });
    op.setUiError("jsonerr", null);

    let httpClient = CABLES.ajax;
    if (jsonp.get()) httpClient = CABLES.jsonp;

    let url = op.patch.getFilePath(filename.get());
    if (addCachebuster)url += "?rnd=" + CABLES.generateUUID();

    op.patch.loading.addAssetLoadingTask(() =>
    {
        const body = inBody.get();
        httpClient(
            url,
            (err, _data, xhr) =>
            {
                outData.set(null);
                outString.set(null);

                if (err)
                {
                    op.patch.loading.finished(loadingId);
                    isLoading.set(false);
                    outData.set(err);
                    outString.set(_data);
                    op.logError(err);
                    outFailed.trigger(); // trigger "Failed" when error occurs
                    return;
                }
                try
                {
                    let data = _data;
                    if (typeof data === "string" && inParseJson.get())
                    {
                        data = JSON.parse(_data);
                        outData.set(data);
                    }
                    outString.set(_data);
                    op.uiAttr({ "error": null });
                    op.patch.loading.finished(loadingId);
                    outTrigger.trigger();
                    outSuccess.trigger(); // trigger "Success" when request is successful
                    isLoading.set(false);
                }
                catch (e)
                {
                    op.logError(e);
                    op.setUiError("jsonerr", "Problem while loading json:<br/>" + e);
                    op.patch.loading.finished(loadingId);
                    isLoading.set(false);
                    outFailed.trigger(); // trigger "Failed" when error occurs in JSON parsing
                }
            },
            inMethod.get(),
            (body && body.length > 0) ? body : null,
            inContentType.get(),
            null,
            headers.get() || {}
        );
    });
}


};

Ops.User.rambodc.AjaxRequest1.prototype = new CABLES.Op();
CABLES.OPS["af7833e1-3efc-42f4-9130-5fd881bc652b"]={f:Ops.User.rambodc.AjaxRequest1,objName:"Ops.User.rambodc.AjaxRequest1"};




// **************************************************************
// 
// Ops.Cables.LoadingStatus_v2
// 
// **************************************************************

Ops.Cables.LoadingStatus_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe = op.inTrigger("exe"),
    preRenderOps = op.inValueBool("PreRender Ops"),
    startTimeLine = op.inBool("Play Timeline", true),
    next = op.outTrigger("Next"),
    outInitialFinished = op.outBoolNum("Finished Initial Loading", false),
    outLoading = op.outBoolNum("Loading"),
    outProgress = op.outNumber("Progress"),
    outList = op.outArray("Jobs"),
    loadingFinished = op.outTrigger("Trigger Loading Finished ");

const cgl = op.patch.cgl;
const patch = op.patch;

let finishedOnce = false;
const preRenderTimes = [];
let firstTime = true;

document.body.classList.add("cables-loading");

let loadingId = cgl.patch.loading.start("loadingStatusInit", "loadingStatusInit", op);

exe.onTriggered = () =>
{
    const jobs = op.patch.loading.getListJobs();
    outProgress.set(patch.loading.getProgress());

    let hasFinished = jobs.length === 0;
    const notFinished = !hasFinished;
    // outLoading.set(!hasFinished);

    if (notFinished)
    {
        outList.set(op.patch.loading.getListJobs());
    }

    if (notFinished)
    {
        if (firstTime)
        {
            if (preRenderOps.get()) op.patch.preRenderOps();

            op.patch.timer.setTime(0);
            if (startTimeLine.get())
            {
                op.patch.timer.play();
            }
            else
            {
                op.patch.timer.pause();
            }
        }
        firstTime = false;

        document.body.classList.remove("cables-loading");
        document.body.classList.add("cables-loaded");
    }
    else
    {
        finishedOnce = true;
        outList.set(op.patch.loading.getListJobs());
        if (patch.loading.getProgress() < 1.0)
        {
            op.patch.timer.setTime(0);
            op.patch.timer.pause();
        }
    }

    outInitialFinished.set(finishedOnce);

    if (outLoading.get() && hasFinished) loadingFinished.trigger();

    outLoading.set(notFinished);
    op.setUiAttribs({ "loading": notFinished });

    next.trigger();

    if (loadingId)
    {
        cgl.patch.loading.finished(loadingId);
        loadingId = null;
    }
};


};

Ops.Cables.LoadingStatus_v2.prototype = new CABLES.Op();
CABLES.OPS["e62f7f4c-7436-437e-8451-6bc3c28545f7"]={f:Ops.Cables.LoadingStatus_v2,objName:"Ops.Cables.LoadingStatus_v2"};




// **************************************************************
// 
// Ops.User.rambodc.Sidebar_Loader1
// 
// **************************************************************

Ops.User.rambodc.Sidebar_Loader1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const inVisible = op.inBool("Visible", false);
const inText = op.inString("Text", "Loading...");

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");

const loader = document.createElement("div");
loader.classList.add("loader");
el.appendChild(loader);

const textEl = document.createElement("p"); // Text element
textEl.classList.add("loaderTextClass"); // New CSS class for the text element
el.appendChild(textEl);

// events
parentPort.onChange = onParentChanged;
inVisible.onChange = onVisibilityChanged;
inText.onChange = onTextChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// functions

function onVisibilityChanged() {
    const visibility = inVisible.get() ? "block" : "none";
    loader.style.display = visibility;
    textEl.style.display = visibility; // Apply the visibility to the text element as well
}

function onTextChanged() {
    textEl.textContent = inText.get();
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}

};

Ops.User.rambodc.Sidebar_Loader1.prototype = new CABLES.Op();
CABLES.OPS["65228516-d029-44e6-9f08-0e0f4e403c35"]={f:Ops.User.rambodc.Sidebar_Loader1,objName:"Ops.User.rambodc.Sidebar_Loader1"};




// **************************************************************
// 
// Ops.User.rambodc.Veriff_incontext_Library
// 
// **************************************************************

Ops.User.rambodc.Veriff_incontext_Library = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};


function addScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');

    s.setAttribute('src', src);
    s.addEventListener('load', resolve);
    s.addEventListener('error', reject);

    document.body.appendChild(s);
  });
}

addScript("https://cdn.veriff.me/incontext/js/v1/veriff.js")


};

Ops.User.rambodc.Veriff_incontext_Library.prototype = new CABLES.Op();
CABLES.OPS["ea7da1f4-a432-4c33-8de6-c0b40910262a"]={f:Ops.User.rambodc.Veriff_incontext_Library,objName:"Ops.User.rambodc.Veriff_incontext_Library"};




// **************************************************************
// 
// Ops.Gl.Meshes.Cube_v2
// 
// **************************************************************

Ops.Gl.Meshes.Cube_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    render = op.inTrigger("Render"),
    active = op.inValueBool("Render Mesh", true),
    width = op.inValue("Width", 1),
    len = op.inValue("Length", 1),
    height = op.inValue("Height", 1),
    center = op.inValueBool("Center", true),
    mapping = op.inSwitch("Mapping", ["Side", "Cube +-"], "Side"),
    mappingBias = op.inValue("Bias", 0),
    inFlipX = op.inValueBool("Flip X", true),
    sideTop = op.inValueBool("Top", true),
    sideBottom = op.inValueBool("Bottom", true),
    sideLeft = op.inValueBool("Left", true),
    sideRight = op.inValueBool("Right", true),
    sideFront = op.inValueBool("Front", true),
    sideBack = op.inValueBool("Back", true),
    trigger = op.outTrigger("Next"),
    geomOut = op.outObject("geometry", null, "geometry");

const cgl = op.patch.cgl;
op.toWorkPortsNeedToBeLinked(render);
op.toWorkShouldNotBeChild("Ops.Gl.TextureEffects.ImageCompose", CABLES.OP_PORT_TYPE_FUNCTION);

op.setPortGroup("Mapping", [mapping, mappingBias, inFlipX]);
op.setPortGroup("Geometry", [width, height, len, center]);
op.setPortGroup("Sides", [sideTop, sideBottom, sideLeft, sideRight, sideFront, sideBack]);

let geom = null,
    mesh = null,
    meshvalid = true,
    needsRebuild = true;

mappingBias.onChange =
    inFlipX.onChange =
    sideTop.onChange =
    sideBottom.onChange =
    sideLeft.onChange =
    sideRight.onChange =
    sideFront.onChange =
    sideBack.onChange =
    mapping.onChange =
    width.onChange =
    height.onChange =
    len.onChange =
    center.onChange = buildMeshLater;

function buildMeshLater()
{
    needsRebuild = true;
}

render.onLinkChanged = function ()
{
    if (!render.isLinked()) geomOut.set(null);
    else geomOut.setRef(geom);
};

render.onTriggered = function ()
{
    if (needsRebuild)buildMesh();
    if (active.get() && mesh && meshvalid) mesh.render(cgl.getShader());
    trigger.trigger();
};

op.preRender = function ()
{
    buildMesh();
    mesh.render(cgl.getShader());
};

function buildMesh()
{
    if (!geom)geom = new CGL.Geometry("cubemesh");
    geom.clear();

    let x = width.get();
    let nx = -1 * width.get();
    let y = height.get();
    let ny = -1 * height.get();
    let z = len.get();
    let nz = -1 * len.get();

    if (!center.get())
    {
        nx = 0;
        ny = 0;
        nz = 0;
    }
    else
    {
        x *= 0.5;
        nx *= 0.5;
        y *= 0.5;
        ny *= 0.5;
        z *= 0.5;
        nz *= 0.5;
    }

    if (mapping.get() == "Side") sideMappedCube(geom, x, y, z, nx, ny, nz);
    else cubeMappedCube(geom, x, y, z, nx, ny, nz);

    geom.verticesIndices = [];
    if (sideTop.get()) geom.verticesIndices.push(8, 9, 10, 8, 10, 11); // Top face
    if (sideBottom.get()) geom.verticesIndices.push(12, 13, 14, 12, 14, 15); // Bottom face
    if (sideLeft.get()) geom.verticesIndices.push(20, 21, 22, 20, 22, 23); // Left face
    if (sideRight.get()) geom.verticesIndices.push(16, 17, 18, 16, 18, 19); // Right face
    if (sideBack.get()) geom.verticesIndices.push(4, 5, 6, 4, 6, 7); // Back face
    if (sideFront.get()) geom.verticesIndices.push(0, 1, 2, 0, 2, 3); // Front face

    if (geom.verticesIndices.length === 0) meshvalid = false;
    else meshvalid = true;

    if (mesh)mesh.dispose();
    mesh = op.patch.cg.createMesh(geom);

    geomOut.setRef(geom);

    needsRebuild = false;
}

op.onDelete = function ()
{
    if (mesh)mesh.dispose();
};

function sideMappedCube(geom, x, y, z, nx, ny, nz)
{
    addAttribs(geom, x, y, z, nx, ny, nz);

    const bias = mappingBias.get();

    let fone = 1.0;
    let fzero = 0.0;
    if (inFlipX.get())
    {
        fone = 0.0;
        fzero = 1.0;
    }

    geom.setTexCoords([
        // Front face
        fzero + bias, 1 - bias,
        fone - bias, 1 - bias,
        fone - bias, 0 + bias,
        fzero + bias, 0 + bias,
        // Back face
        fone - bias, 1 - bias,
        fone - bias, 0 + bias,
        fzero + bias, 0 + bias,
        fzero + bias, 1 - bias,
        // Top face
        fzero + bias, 0 + bias,
        fzero + bias, 1 - bias,
        fone - bias, 1 - bias,
        fone - bias, 0 + bias,
        // Bottom face
        fone - bias, 0 + bias,
        fzero + bias, 0 + bias,
        fzero + bias, 1 - bias,
        fone - bias, 1 - bias,
        // Right face
        fone - bias, 1 - bias,
        fone - bias, 0 + bias,
        fzero + bias, 0 + bias,
        fzero + bias, 1 - bias,
        // Left face
        fzero + bias, 1 - bias,
        fone - bias, 1 - bias,
        fone - bias, 0 + bias,
        fzero + bias, 0 + bias,
    ]);
}

function cubeMappedCube(geom, x, y, z, nx, ny, nz)
{
    addAttribs(geom, x, y, z, nx, ny, nz);

    const sx = 0.25;
    const sy = 1 / 3;
    const bias = mappingBias.get();

    let flipx = 0.0;
    if (inFlipX.get()) flipx = 1.0;

    const tc = [];
    tc.push(
        // Front face   Z+
        flipx + sx + bias, sy * 2 - bias,
        flipx + sx * 2 - bias, sy * 2 - bias,
        flipx + sx * 2 - bias, sy + bias,
        flipx + sx + bias, sy + bias,
        // Back face Z-
        flipx + sx * 4 - bias, sy * 2 - bias,
        flipx + sx * 4 - bias, sy + bias,
        flipx + sx * 3 + bias, sy + bias,
        flipx + sx * 3 + bias, sy * 2 - bias);

    if (inFlipX.get())
        tc.push(
            // Top face
            sx + bias, 0 - bias,
            sx * 2 - bias, 0 - bias,
            sx * 2 - bias, sy * 1 + bias,
            sx + bias, sy * 1 + bias,
            // Bottom face
            sx + bias, sy * 3 + bias,
            sx + bias, sy * 2 - bias,
            sx * 2 - bias, sy * 2 - bias,
            sx * 2 - bias, sy * 3 + bias
        );

    else
        tc.push(
            // Top face
            sx + bias, 0 + bias,
            sx + bias, sy * 1 - bias,
            sx * 2 - bias, sy * 1 - bias,
            sx * 2 - bias, 0 + bias,
            // Bottom face
            sx + bias, sy * 3 - bias,
            sx * 2 - bias, sy * 3 - bias,
            sx * 2 - bias, sy * 2 + bias,
            sx + bias, sy * 2 + bias);

    tc.push(
        // Right face
        flipx + sx * 3 - bias, 1.0 - sy - bias,
        flipx + sx * 3 - bias, 1.0 - sy * 2 + bias,
        flipx + sx * 2 + bias, 1.0 - sy * 2 + bias,
        flipx + sx * 2 + bias, 1.0 - sy - bias,
        // Left face
        flipx + sx * 0 + bias, 1.0 - sy - bias,
        flipx + sx * 1 - bias, 1.0 - sy - bias,
        flipx + sx * 1 - bias, 1.0 - sy * 2 + bias,
        flipx + sx * 0 + bias, 1.0 - sy * 2 + bias);

    geom.setTexCoords(tc);
}

function addAttribs(geom, x, y, z, nx, ny, nz)
{
    geom.vertices = [
        // Front face
        nx, ny, z,
        x, ny, z,
        x, y, z,
        nx, y, z,
        // Back face
        nx, ny, nz,
        nx, y, nz,
        x, y, nz,
        x, ny, nz,
        // Top face
        nx, y, nz,
        nx, y, z,
        x, y, z,
        x, y, nz,
        // Bottom face
        nx, ny, nz,
        x, ny, nz,
        x, ny, z,
        nx, ny, z,
        // Right face
        x, ny, nz,
        x, y, nz,
        x, y, z,
        x, ny, z,
        // zeft face
        nx, ny, nz,
        nx, ny, z,
        nx, y, z,
        nx, y, nz
    ];

    geom.vertexNormals = new Float32Array([
        // Front face
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,
        0.0, 0.0, 1.0,

        // Back face
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,
        0.0, 0.0, -1.0,

        // Top face
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0,

        // Bottom face
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,
        0.0, -1.0, 0.0,

        // Right face
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,
        1.0, 0.0, 0.0,

        // Left face
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0,
        -1.0, 0.0, 0.0
    ]);
    geom.tangents = new Float32Array([
        // front face
        0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0,
        // back face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // top face
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        // bottom face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // right face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // left face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1
    ]);
    geom.biTangents = new Float32Array([
        // front face
        -1, 0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0,
        // back face
        1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0,
        // top face
        0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
        // bottom face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1,
        // right face
        0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1,
        // left face
        0, 0, -1, 0, 0, -1, 0, 0, -1, 0, 0, -1
    ]);
}


};

Ops.Gl.Meshes.Cube_v2.prototype = new CABLES.Op();
CABLES.OPS["37b92ba4-cea5-42ae-bf28-a513ca28549c"]={f:Ops.Gl.Meshes.Cube_v2,objName:"Ops.Gl.Meshes.Cube_v2"};




// **************************************************************
// 
// Ops.Anim.Timer_v2
// 
// **************************************************************

Ops.Anim.Timer_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inSpeed = op.inValue("Speed", 1),
    playPause = op.inValueBool("Play", true),
    reset = op.inTriggerButton("Reset"),
    inSyncTimeline = op.inValueBool("Sync to timeline", false),
    outTime = op.outNumber("Time");

op.setPortGroup("Controls", [playPause, reset, inSpeed]);

const timer = new CABLES.Timer();
let lastTime = null;
let time = 0;
let syncTimeline = false;

playPause.onChange = setState;
setState();

function setState()
{
    if (playPause.get())
    {
        timer.play();
        op.patch.addOnAnimFrame(op);
    }
    else
    {
        timer.pause();
        op.patch.removeOnAnimFrame(op);
    }
}

reset.onTriggered = doReset;

function doReset()
{
    time = 0;
    lastTime = null;
    timer.setTime(0);
    outTime.set(0);
}

inSyncTimeline.onChange = function ()
{
    syncTimeline = inSyncTimeline.get();
    playPause.setUiAttribs({ "greyout": syncTimeline });
    reset.setUiAttribs({ "greyout": syncTimeline });
};

op.onAnimFrame = function (tt)
{
    if (timer.isPlaying())
    {
        if (CABLES.overwriteTime !== undefined)
        {
            outTime.set(CABLES.overwriteTime * inSpeed.get());
        }
        else

        if (syncTimeline)
        {
            outTime.set(tt * inSpeed.get());
        }
        else
        {
            timer.update();
            const timerVal = timer.get();

            if (lastTime === null)
            {
                lastTime = timerVal;
                return;
            }

            const t = Math.abs(timerVal - lastTime);
            lastTime = timerVal;

            time += t * inSpeed.get();
            if (time != time)time = 0;
            outTime.set(time);
        }
    }
};


};

Ops.Anim.Timer_v2.prototype = new CABLES.Op();
CABLES.OPS["aac7f721-208f-411a-adb3-79adae2e471a"]={f:Ops.Anim.Timer_v2,objName:"Ops.Anim.Timer_v2"};




// **************************************************************
// 
// Ops.User.rambodc.SideBarSwitch_Tabs
// 
// **************************************************************

Ops.User.rambodc.SideBarSwitch_Tabs = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const parentPort = op.inObject("link"),
    inArr = op.inArray("Names"),
    inStyle = op.inSwitch("Style", ["Tabs", "Switch"], "Switch"),
    labelPort = op.inString("Text", "Switch"),

    inInput = op.inInt("Input", 0),

    setDefaultValueButtonPort = op.inTriggerButton("Set Default"),
    inGreyOut = op.inBool("Grey Out", false),

    inDefault = op.inValue("Default", 0),

    siblingsPort = op.outObject("childs"),
    outIndex = op.outNumber("Index", -1),
    outStr = op.outString("String"),
    outClose = op.outTrigger("Close"), // Added this output
    outCloseTab = op.outString("Close Tab"); // Added this output

let elTabActive = null;
const el = document.createElement("div");
el.classList.add("sidebar__item");
el.dataset.op = op.id;
el.classList.add("cablesEle");
inDefault.setUiAttribs({ "greyout": true });

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);

const switchGroup = document.createElement("div");
el.appendChild(switchGroup);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

parentPort.onChange = onParentChanged;
op.onDelete = onDelete;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");
op.setPortGroup("Default Item", [inDefault, setDefaultValueButtonPort]);
const tabEles = [];

inArr.onChange = rebuildHtml;
inStyle.onChange = updateStyle;
updateStyle();

labelPort.onChange = () =>
{
    label.innerHTML = labelPort.get();
};

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

function rebuildHtml()
{
    tabEles.length = 0;
    switchGroup.innerHTML = "";
    elTabActive = null;

    const arr = inArr.get();
    if (!arr) return;

    for (let i = 0; i < arr.length; i++)
    {
        const el = addTab(String(arr[i]));
        if (i == inDefault.get())setActiveTab(el);
    }
}

setDefaultValueButtonPort.onTriggered = () =>
{
    inDefault.set(outIndex.get());
    op.refreshParams();
};

function updateStyle()
{
    if (inStyle.get() == "Tabs")
    {
        el.classList.add("sidebar_tabs");
        switchGroup.classList.remove("sidebar_switchs");
        label.style.display = "none";
    }
    else
    {
        el.classList.remove("sidebar_tabs");
        switchGroup.classList.add("sidebar_switchs");
        label.style.display = "inline-block";
    }

    labelPort.setUiAttribs({ "greyout": inStyle.get() == "Tabs" });

    rebuildHtml();
}

function addTab(title)
{
    const tabEle = document.createElement("div");

    if (inStyle.get() == "Tabs") tabEle.classList.add("sidebar_tab");
    else tabEle.classList.add("sidebar_switch");

    tabEle.id = "tabEle" + tabEles.length;
    tabEle.innerHTML = title;
    tabEle.dataset.index = tabEles.length;
    tabEle.dataset.txt = title;

    const closeButton = document.createElement("span"); // Create new close button
    closeButton.innerHTML = "x"; // Assign 'x' as button text
    closeButton.className = "tab-close-button"; // Assign class
    closeButton.dataset.index = tabEles.length; // Assign index to button

    // If the tab title is "Home", add 'hide' class to the close button
    if (title === "Home") {
        closeButton.classList.add("hide");
    }

    closeButton.onclick = function (event) { // Close button click event
        event.stopPropagation(); // To prevent tabClick event from firing
        outClose.trigger(); // Trigger the Close output
        outCloseTab.set(title); // Set the tab title in the Close Tab output
    };

    tabEle.appendChild(closeButton);

    tabEle.addEventListener("click", tabClicked);

    switchGroup.appendChild(tabEle);

    tabEles.push(tabEle);

    return tabEle;
}

inInput.onChange = () =>
{
    if (tabEles.length > inInput.get())
        tabClicked({ "target": tabEles[inInput.get()] });
};

function setActiveTab(el)
{
    if (el)
    {
        elTabActive = el;
        op.log(el.dataset.index);
        outIndex.set(parseInt(el.dataset.index));
        outStr.set(el.dataset.txt);

        if (inStyle.get() == "Tabs") el.classList.add("sidebar_tab_active");
        else el.classList.add("sidebar_switch_active");
    }
}

function tabClicked(e)
{
    if (elTabActive)
        if (inStyle.get() == "Tabs") elTabActive.classList.remove("sidebar_tab_active");
        else elTabActive.classList.remove("sidebar_switch_active");
    setActiveTab(e.target);
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    {
        if (el.parentElement)
            el.parentElement.removeChild(el);
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.SideBarSwitch_Tabs.prototype = new CABLES.Op();
CABLES.OPS["0f44c345-4f5c-4e76-a918-6dc212398cdb"]={f:Ops.User.rambodc.SideBarSwitch_Tabs,objName:"Ops.User.rambodc.SideBarSwitch_Tabs"};




// **************************************************************
// 
// Ops.User.rambodc.Min_Max_Value
// 
// **************************************************************

Ops.User.rambodc.Min_Max_Value = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs
const value = op.inValue("Value", 0); // Default value 0
const max = op.inValue("Max", 1); // Default max 1
const min = op.inValue("Min", 0); // Default min 0

// Outputs
const result = op.outNumber("Result");

// OnChange triggers
value.onChange = max.onChange = min.onChange = checkValue;

// Initial check
checkValue();

// Function to check if value is between min and max
function checkValue()
{
    let v = value.get();
    let minValue = min.get();
    let maxValue = max.get();

    if (v > maxValue)
    {
        v = maxValue;
    }
    else if (v < minValue)
    {
        v = minValue;
    }

    result.set(v);
}


};

Ops.User.rambodc.Min_Max_Value.prototype = new CABLES.Op();
CABLES.OPS["7699501a-fd1d-4300-93d4-35715f250fa3"]={f:Ops.User.rambodc.Min_Max_Value,objName:"Ops.User.rambodc.Min_Max_Value"};




// **************************************************************
// 
// Ops.User.rambodc.Orientation_is_Portrait
// 
// **************************************************************

Ops.User.rambodc.Orientation_is_Portrait = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inWidth = op.inValue("Width"),
    inHeight = op.inValue("Height"),
    isPortrait = op.outBool("IsPortrait");

inWidth.onChange = inHeight.onChange = updateScreenMode;

function updateScreenMode() {
    let width = inWidth.get();
    let height = inHeight.get();
    isPortrait.set(height > width);
}


};

Ops.User.rambodc.Orientation_is_Portrait.prototype = new CABLES.Op();
CABLES.OPS["43fed3b4-761c-4d1c-b64a-f8ab15c26991"]={f:Ops.User.rambodc.Orientation_is_Portrait,objName:"Ops.User.rambodc.Orientation_is_Portrait"};




// **************************************************************
// 
// Ops.User.rambodc.Bool_numbers
// 
// **************************************************************

Ops.User.rambodc.Bool_numbers = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inBool = op.inValue("Bool Input"),
    trueValue = op.inValue("True Value"),
    falseValue = op.inValue("False Value"),
    outputValue = op.outValue("Output Value");

inBool.onChange = trueValue.onChange = falseValue.onChange = updateOutput;

function updateOutput() {
    let bool = inBool.get();
    if(bool === true) {
        outputValue.set(trueValue.get());
    } else if(bool === false) {
        outputValue.set(falseValue.get());
    }
}


};

Ops.User.rambodc.Bool_numbers.prototype = new CABLES.Op();
CABLES.OPS["bebb71bb-87c3-41e3-9ed1-8f52440a07b3"]={f:Ops.User.rambodc.Bool_numbers,objName:"Ops.User.rambodc.Bool_numbers"};




// **************************************************************
// 
// Ops.User.rambodc.StringCompose2
// 
// **************************************************************

Ops.User.rambodc.StringCompose2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    format=op.inString('Format',"hello $a, $b $c und $d $g $h $i $j $k"),
    a=op.inString('String A'),
    b=op.inString('String B'),
    c=op.inString('String C'),
    d=op.inString('String D'),
    e=op.inString('String E'),
    f=op.inString('String F'),
    g=op.inValue('Number G'),
    h=op.inValue('Number H'),
    i=op.inValue('Number I'),
    j=op.inValue('Number J'),
    k=op.inValue('Number K'),
    result=op.outString("Result");

format.onChange=
    a.onChange=
    b.onChange=
    c.onChange=
    d.onChange=
    e.onChange=
    f.onChange=
    g.onChange=
    h.onChange=
    i.onChange=
    j.onChange=
    k.onChange=update;

update();

function update()
{
    var str=format.get()||'';
    if(typeof str!='string')
        str='';

    str = str.replace(/\$a/g, a.get());
    str = str.replace(/\$b/g, b.get());
    str = str.replace(/\$c/g, c.get());
    str = str.replace(/\$d/g, d.get());
    str = str.replace(/\$e/g, e.get());
    str = str.replace(/\$f/g, f.get());
    str = str.replace(/\$g/g, g.get().toString());
    str = str.replace(/\$h/g, h.get().toString());
    str = str.replace(/\$i/g, i.get().toString());
    str = str.replace(/\$j/g, j.get().toString());
    str = str.replace(/\$k/g, k.get().toString());

    result.set(str);
}


};

Ops.User.rambodc.StringCompose2.prototype = new CABLES.Op();
CABLES.OPS["7607fdde-309d-4ab9-b38f-58611ed08903"]={f:Ops.User.rambodc.StringCompose2,objName:"Ops.User.rambodc.StringCompose2"};




// **************************************************************
// 
// Ops.Value.Boolean
// 
// **************************************************************

Ops.Value.Boolean = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    v = op.inValueBool("value", false),
    result = op.outBoolNum("result");

result.set(false);
v.onChange = exec;

function exec()
{
    if (result.get() != v.get()) result.set(v.get());
}


};

Ops.Value.Boolean.prototype = new CABLES.Op();
CABLES.OPS["83e2d74c-9741-41aa-a4d7-1bda4ef55fb3"]={f:Ops.Value.Boolean,objName:"Ops.Value.Boolean"};




// **************************************************************
// 
// Ops.User.rambodc.FBGetOneDocument1
// 
// **************************************************************

Ops.User.rambodc.FBGetOneDocument1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
//input
const inTrigger = op.inTriggerButton("Trigger");
const inCollectionName = op.inString("Collection name");
const inDocumentID = op.inString("Document ID");
const inSubcollectionName = op.inString("Subcollection name", "");
const inSubdocumentID = op.inString("Subdocument ID", "");

//output
const outError = op.outBoolNum("Error", false);
const outErrorMessage = op.outString("Error Message");
const outDocument = op.outObject("Document");
const outDocumentNotFound = op.outValueBool("Document Not Found");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");

inTrigger.onTriggered = getDocument;

function getDocument(){
    if (!inCollectionName.get() || !inDocumentID.get()){
        outError.set(true);
        outErrorMessage.set(
            "Missing Arguments: Collection name or Document ID is missing!"
        );
        outDocument.set(null);
        outDocumentNotFound.set(false);
        return;
    }

    let db;
    try {
        db = firebase.firestore();
    } catch (e) {
        console.log(e);
    }

    let docRef;

    // Check if subcollection and subdocument ID are provided
    if(inSubcollectionName.get() && inSubdocumentID.get()){
        docRef = db.collection(inCollectionName.get())
                    .doc(inDocumentID.get())
                    .collection(inSubcollectionName.get())
                    .doc(inSubdocumentID.get());
    } else {
        docRef = db.collection(inCollectionName.get()).doc(inDocumentID.get());
    }

    docRef.get().then((doc) => {
        if (doc.exists) {
            outDocument.set(doc.data());
            outDocumentNotFound.set(false);
            outSuccess.trigger();
        } else {
            outDocument.set(null);
            outDocumentNotFound.set(true);
            outFailure.trigger();
        }
        outError.set(false);
        outErrorMessage.set(null);

    }).catch((error) => {
        outError.set(true);
        outErrorMessage.set(error.message);
        outFailure.trigger();
    });
}

};

Ops.User.rambodc.FBGetOneDocument1.prototype = new CABLES.Op();
CABLES.OPS["a6ccf5c5-2236-4dd4-895e-98b6240f68e1"]={f:Ops.User.rambodc.FBGetOneDocument1,objName:"Ops.User.rambodc.FBGetOneDocument1"};




// **************************************************************
// 
// Ops.Boolean.IfTrueThen_v2
// 
// **************************************************************

Ops.Boolean.IfTrueThen_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    exe = op.inTrigger("exe"),
    boolean = op.inValueBool("boolean", false),
    triggerThen = op.outTrigger("then"),
    triggerElse = op.outTrigger("else");

exe.onTriggered = exec;

let b = false;

boolean.onChange = () =>
{
    b = boolean.get();
};

function exec()
{
    if (b) triggerThen.trigger();
    else triggerElse.trigger();
}


};

Ops.Boolean.IfTrueThen_v2.prototype = new CABLES.Op();
CABLES.OPS["9549e2ed-a544-4d33-a672-05c7854ccf5d"]={f:Ops.Boolean.IfTrueThen_v2,objName:"Ops.Boolean.IfTrueThen_v2"};




// **************************************************************
// 
// Ops.Net.CorsProxy_v2
// 
// **************************************************************

Ops.Net.CorsProxy_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
let a = op.inString("URL", "");
let result = op.outString("CORS URL");
let CORS_CABLES_PROXY = "https://cors.cables.gl/";

a.onChange = update;

update();

function update()
{
    result.set(CORS_CABLES_PROXY + a.get());
}


};

Ops.Net.CorsProxy_v2.prototype = new CABLES.Op();
CABLES.OPS["0cac2fb2-cac2-4b50-82c1-f7047ef96e0a"]={f:Ops.Net.CorsProxy_v2,objName:"Ops.Net.CorsProxy_v2"};




// **************************************************************
// 
// Ops.User.rambodc.DivElement_v2
// 
// **************************************************************

Ops.User.rambodc.DivElement_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inText = op.inString("Text", "Hello Div"),
    inId = op.inString("Id"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", "position:absolute;\nz-index:100;", "inline-css"),
    inInteractive = op.inValueBool("Interactive", false),
    inVisible = op.inValueBool("Visible", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    inPropagation = op.inValueBool("Propagate Click-Events", true),
    outElement = op.outObject("DOM Element", null, "element"),
    outHover = op.outValue("Hover"),
    outClicked = op.outTrigger("Clicked");

let listenerElement = null;
let oldStr = null;
let prevDisplay = "block";
let div = null;

const canvas = op.patch.cgl.canvas.parentElement;

createElement();

inClass.onChange = updateClass;
inBreaks.onChange = inText.onChange = updateText;
inStyle.onChange = updateStyle;
inInteractive.onChange = updateInteractive;
inVisible.onChange = updateVisibility;

updateText();
updateStyle();
warning();
updateInteractive();

op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

function createElement()
{
    div = document.createElement("div");
    div.dataset.op = op.id;
    div.classList.add("cablesEle");

    if (inId.get()) div.id = inId.get();

    canvas.appendChild(div);
    outElement.set(div);
}

function removeElement()
{
    if (div) removeClasses();
    if (div && div.parentNode) div.parentNode.removeChild(div);
    oldStr = null;
    div = null;
}

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        // prevDisplay=div.style.display||'block';
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = prevDisplay;
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateText()
{
    let str = inText.get();

    if (oldStr === str) return;
    oldStr = str;

    if (str && inBreaks.get()) str = str.replace(/(?:\r\n|\r|\n)/g, "<br>");

    if (div.innerHTML != str) div.innerHTML = str;
    outElement.set(null);
    outElement.set(div);
}

// inline css inisde div
function updateStyle()
{
    if (!div) return;
    // if (inStyle.get() != div.style)
    // {
    div.setAttribute("style", inStyle.get());
    updateVisibility();
    outElement.set(null);
    outElement.set(div);
    // }

    if (!div.parentElement)
    {
        canvas.appendChild(div);
    }

    warning();
}

let oldClassesStr = "";

function removeClasses()
{
    if (!div) return;

    const classes = (inClass.get() || "").split(" ");
    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i]) div.classList.remove(classes[i]);
    }
    oldClassesStr = "";
}

function updateClass()
{
    const classes = (inClass.get() || "").split(" ");
    const oldClasses = (oldClassesStr || "").split(" ");

    let found = false;

    for (let i = 0; i < oldClasses.length; i++)
    {
        if (
            oldClasses[i] &&
            classes.indexOf(oldClasses[i].trim()) == -1)
        {
            found = true;
            div.classList.remove(oldClasses[i]);
        }
    }

    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i])
        {
            div.classList.add(classes[i].trim());
        }
    }

    oldClassesStr = inClass.get();
    warning();
}

function onMouseEnter(e)
{
    outHover.set(true);
}

function onMouseLeave(e)
{
    outHover.set(false);
}





let lastClickTime = 0;

function onMouseClick(e)
{
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    // Ignore any clicks that happen within 10ms of the last click
    if (timeDiff < 10) {
        return;
    }

    lastClickTime = currentTime;

    if (!inPropagation.get())
    {
        e.stopPropagation();
    }
    outClicked.trigger();
}





function updateInteractive()
{
    removeListeners();
    if (inInteractive.get()) addListeners();
}

inId.onChange = function ()
{
    div.id = inId.get();
};

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("pointerup", onMouseClick);
        listenerElement.removeEventListener("pointerleave", onMouseLeave);
        listenerElement.removeEventListener("pointerenter", onMouseEnter);
        listenerElement = null;
    }
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = div;

    if (listenerElement)
    {
        listenerElement.addEventListener("pointerup", onMouseClick);
        listenerElement.addEventListener("pointerleave", onMouseLeave);
        listenerElement.addEventListener("pointerenter", onMouseEnter);
    }
}

op.addEventListener("onEnabledChange", function (enabled)
{
    removeElement();
    if (enabled)
    {
        createElement();
        updateStyle();
        updateClass();
        updateText();
        updateInteractive();
    }
    // if(enabled) updateVisibility();
    // else setCSSVisible(false);
});

function warning()
{
    if (inClass.get() && inStyle.get())
    {
        op.setUiError("error", "DIV uses external and inline CSS", 1);
    }
    else
    {
        op.setUiError("error", null);
    }
}


};

Ops.User.rambodc.DivElement_v2.prototype = new CABLES.Op();
CABLES.OPS["4a726569-54da-4cb2-98a4-9a56823c19ed"]={f:Ops.User.rambodc.DivElement_v2,objName:"Ops.User.rambodc.DivElement_v2"};




// **************************************************************
// 
// Ops.Html.ElementChilds_v2
// 
// **************************************************************

Ops.Html.ElementChilds_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    parentPort = op.inObject("Parent", null, "element"),
    outParent = op.outObject("Parent Out", null, "element");

const canvas = op.patch.cgl.canvas.parentElement;

const inPorts = [];
for (let i = 0; i < 10; i++)
{
    const p = op.inObject("Child " + (i + 1));
    inPorts.push(p);
    p.onChange = () =>
    {
        rebuild();
        if (!p.get())
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = canvas.querySelector(selector);
            if (currentChild) delete currentChild.dataset.cablesChildId;
        }
    };
    p.onLinkChanged = () =>
    {
        if (!p.isLinked())
        {
            const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
            const currentChild = canvas.querySelector(selector);
            if (currentChild) currentChild.remove();
        }
    };
}

parentPort.onLinkChanged = () =>
{
    if (!parentPort.isLinked())
    {
        cleanUp();
    }
    else
    {
        rebuild();
    }
};

outParent.onLinkChanged = () =>
{
    if (!outParent.isLinked())
    {
        const parentDiv = parentPort.get();
        if (parentDiv && parentDiv.dataset.op)
        {
            const inDoc = canvas.querySelector("[data-op=' " + parentDiv.dataset.op + " ']");
            if (!inDoc)
            {
                canvas.appendChild(parentDiv);
            }
        }
    }
};

parentPort.onChange = () =>
{
    if (!parentPort.get())
    {
        cleanUp();
    }
    rebuild();
};

function cleanUp()
{
    for (let i = 0; i < inPorts.length; i++)
    {
        const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
        const currentChild = canvas.querySelector(selector);
        if (currentChild && currentChild.parentNode)
        {
            currentChild.remove();
        }
    }
    outParent.set(null);
}

function rebuild()
{
    const parent = parentPort.get();
    if (!parent)
    {
        outParent.set(null);
        return;
    }


    if (!parent.querySelector)
    {
        outParent.set(null);
        return;
    }

    for (let i = 0; i < inPorts.length; i++)
    {
        const selector = "[data-cables-child-id='" + op.id + "_" + i + "']";
        const currentChild = parent.querySelector(selector);
        if (currentChild)
        {
            currentChild.remove();
        }
        const p = inPorts[i].get();
        if (p && parent)
        {
            if (!p.dataset)console.log("p no dataset ?!");
            else p.dataset.cablesChildId = op.id + "_" + i;
            parent.appendChild(p);
        }
    }

    outParent.set(null);
    outParent.set(parent);
}


};

Ops.Html.ElementChilds_v2.prototype = new CABLES.Op();
CABLES.OPS["ad7eea9a-f4af-4ab7-bb70-922242529681"]={f:Ops.Html.ElementChilds_v2,objName:"Ops.Html.ElementChilds_v2"};




// **************************************************************
// 
// Ops.Html.DivElement_v3
// 
// **************************************************************

Ops.Html.DivElement_v3 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inText = op.inString("Text", "Hello Div"),
    inId = op.inString("Id"),
    inClass = op.inString("Class"),
    inStyle = op.inStringEditor("Style", "position:absolute;\nz-index:100;", "inline-css"),
    inInteractive = op.inValueBool("Interactive", false),
    inVisible = op.inValueBool("Visible", true),
    inBreaks = op.inValueBool("Convert Line Breaks", false),
    inPropagation = op.inValueBool("Propagate Click-Events", true),
    outElement = op.outObject("DOM Element", null, "element"),
    outHover = op.outBoolNum("Hover"),
    outClicked = op.outTrigger("Clicked");

let listenerElement = null;
let oldStr = null;
let prevDisplay = "block";
let div = null;

const canvas = op.patch.cgl.canvas.parentElement;

createElement();

inClass.onChange = updateClass;
inBreaks.onChange = inText.onChange = updateText;
inStyle.onChange = updateStyle;
inInteractive.onChange = updateInteractive;
inVisible.onChange = updateVisibility;

updateText();
updateStyle();
warning();
updateInteractive();

op.onDelete = removeElement;

outElement.onLinkChanged = updateStyle;

function createElement()
{
    div = document.createElement("div");
    div.dataset.op = op.id;
    div.classList.add("cablesEle");

    if (inId.get()) div.id = inId.get();

    canvas.appendChild(div);
    outElement.set(div);
}

function removeElement()
{
    if (div) removeClasses();
    if (div && div.parentNode) div.parentNode.removeChild(div);
    oldStr = null;
    div = null;
}

function setCSSVisible(visible)
{
    if (!visible)
    {
        div.style.visibility = "hidden";
        prevDisplay = div.style.display || "block";
        div.style.display = "none";
    }
    else
    {
        // prevDisplay=div.style.display||'block';
        if (prevDisplay == "none") prevDisplay = "block";
        div.style.visibility = "visible";
        div.style.display = prevDisplay;
    }
}

function updateVisibility()
{
    setCSSVisible(inVisible.get());
}

function updateText()
{
    let str = inText.get();

    if (oldStr === str) return;
    oldStr = str;

    if (str && inBreaks.get()) str = str.replace(/(?:\r\n|\r|\n)/g, "<br>");

    if (div.innerHTML != str) div.innerHTML = str;
    outElement.set(null);
    outElement.set(div);
}

// inline css inisde div
function updateStyle()
{
    if (!div) return;
    // if (inStyle.get() != div.style)
    // {
    div.setAttribute("style", inStyle.get());
    updateVisibility();
    outElement.set(null);
    outElement.set(div);
    // }

    if (!div.parentElement)
    {
        canvas.appendChild(div);
    }

    warning();
}

let oldClassesStr = "";

function removeClasses()
{
    if (!div) return;

    const classes = (inClass.get() || "").split(" ");
    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i]) div.classList.remove(classes[i]);
    }
    oldClassesStr = "";
}

function updateClass()
{
    const classes = (inClass.get() || "").split(" ");
    const oldClasses = (oldClassesStr || "").split(" ");

    let found = false;

    for (let i = 0; i < oldClasses.length; i++)
    {
        if (
            oldClasses[i] &&
            classes.indexOf(oldClasses[i].trim()) == -1)
        {
            found = true;
            div.classList.remove(oldClasses[i]);
        }
    }

    for (let i = 0; i < classes.length; i++)
    {
        if (classes[i])
        {
            div.classList.add(classes[i].trim());
        }
    }

    oldClassesStr = inClass.get();
    warning();
}

function onMouseEnter(e)
{
    outHover.set(true);
}

function onMouseLeave(e)
{
    outHover.set(false);
}

function onMouseClick(e)
{
    if (!inPropagation.get())
    {
        e.stopPropagation();
    }
    outClicked.trigger();
}

function updateInteractive()
{
    removeListeners();
    if (inInteractive.get()) addListeners();
}

inId.onChange = function ()
{
    div.id = inId.get();
};

function removeListeners()
{
    if (listenerElement)
    {
        listenerElement.removeEventListener("pointerdown", onMouseClick);
        listenerElement.removeEventListener("pointerleave", onMouseLeave);
        listenerElement.removeEventListener("pointerenter", onMouseEnter);
        listenerElement = null;
    }
}

function addListeners()
{
    if (listenerElement)removeListeners();

    listenerElement = div;

    if (listenerElement)
    {
        listenerElement.addEventListener("pointerdown", onMouseClick);
        listenerElement.addEventListener("pointerleave", onMouseLeave);
        listenerElement.addEventListener("pointerenter", onMouseEnter);
    }
}

op.addEventListener("onEnabledChange", function (enabled)
{
    removeElement();
    if (enabled)
    {
        createElement();
        updateStyle();
        updateClass();
        updateText();
        updateInteractive();
    }
    // if(enabled) updateVisibility();
    // else setCSSVisible(false);
});

function warning()
{
    if (inClass.get() && inStyle.get())
    {
        op.setUiError("error", "DIV uses external and inline CSS", 1);
    }
    else
    {
        op.setUiError("error", null);
    }
}


};

Ops.Html.DivElement_v3.prototype = new CABLES.Op();
CABLES.OPS["d55d398c-e68e-486b-b0ce-d9c4bdf7df05"]={f:Ops.Html.DivElement_v3,objName:"Ops.Html.DivElement_v3"};




// **************************************************************
// 
// Ops.User.rambodc.FBUpdateDocument1
// 
// **************************************************************

Ops.User.rambodc.FBUpdateDocument1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// input
const inTrigger = op.inTriggerButton("Trigger");
const inCollectionName = op.inString("Collection name");
const inDocumentID = op.inString("Document ID");
const inSubCollectionName = op.inString("SubCollection name");
const inSubDocumentID = op.inString("SubDocument ID");
const inDocument = op.inObject("Document");
const inUpdateTimestamp = op.inBool("Update Timestamp");
const inTimestampPath = op.inString("Timestamp Path", "");

// output
const outError = op.outBoolNum("Error", false);
const outErrorMessage = op.outString("Error Message");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");
const outTimestampPath = op.outString("Timestamp Path");

inTrigger.onTriggered = updateDocument;

function updateDocument()
{
    if (!inCollectionName.get() || !inDocumentID.get())
    {
        outError.set(true);
        outErrorMessage.set("Missing Arguments: Collection name or Document ID is missing!");
        outFailure.trigger();
        return;
    }

    let documentToUpdate = inDocument.get() ? { ...inDocument.get() } : {};

    if (inUpdateTimestamp.get())
    {
        let path = inTimestampPath.get();
        if (path)
        {
            let pathArr = path.split(".");
            let timestampObj = {};
            let tempObj = timestampObj;
            for (let i = 0; i < pathArr.length - 1; i++)
            {
                tempObj[pathArr[i]] = {};
                tempObj = tempObj[pathArr[i]];
            }
            tempObj[pathArr[pathArr.length - 1]] = firebase.firestore.FieldValue.serverTimestamp();
            Object.assign(documentToUpdate, timestampObj);
            outTimestampPath.set(path);
        }
        else
        {
            documentToUpdate.lastUpdated = firebase.firestore.FieldValue.serverTimestamp();
            outTimestampPath.set("lastUpdated");
        }
    }

    const db = firebase.firestore();
    let docRef = db.collection(inCollectionName.get()).doc(inDocumentID.get());

    // if sub collection name and sub document ID are provided, use them
    if (inSubCollectionName.get() && inSubDocumentID.get())
    {
        docRef = docRef.collection(inSubCollectionName.get()).doc(inSubDocumentID.get());
    }

    docRef
        .update(documentToUpdate)
        .then(() =>
        {
            outError.set(false);
            outErrorMessage.set("");
            outSuccess.trigger();
        })
        .catch((error) =>
        {
            outError.set(true);
            outErrorMessage.set(error.message);
            outFailure.trigger();
        });
}


};

Ops.User.rambodc.FBUpdateDocument1.prototype = new CABLES.Op();
CABLES.OPS["6f6aa994-d218-4d67-9ff2-b403b10aa6ea"]={f:Ops.User.rambodc.FBUpdateDocument1,objName:"Ops.User.rambodc.FBUpdateDocument1"};




// **************************************************************
// 
// Ops.User.rambodc.Bool_False_Delay
// 
// **************************************************************

Ops.User.rambodc.Bool_False_Delay = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const inBoolean = op.inValueBool("Input Boolean", true);
const inDelaySec = op.inValue("Delay Sec", 1);

// outputs
const outBoolean = op.outBoolNum("Boolean Output", 1);
const outTrigger = op.outTrigger("Output Trigger");

// variable to hold timeout ID
let timeoutId = null;

// watch for changes in the input boolean
inBoolean.onChange = function() {
  // if input is true, make output true and clear any existing timeout
  if (inBoolean.get()) {
    outBoolean.set(true);
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  }
  // if input is false, set a timeout
  else if (timeoutId === null) {
    timeoutId = setTimeout(function() {
      outBoolean.set(false);
      outTrigger.trigger();
      timeoutId = null;
    }, inDelaySec.get() * 1000);
  }
};

// update the timeout when delay changes
inDelaySec.onChange = function() {
  if (!inBoolean.get() && timeoutId !== null) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function() {
      outBoolean.set(false);
      outTrigger.trigger();
      timeoutId = null;
    }, inDelaySec.get() * 1000);
  }
};


};

Ops.User.rambodc.Bool_False_Delay.prototype = new CABLES.Op();
CABLES.OPS["d31d8485-bb12-4403-9231-ea8914d3d929"]={f:Ops.User.rambodc.Bool_False_Delay,objName:"Ops.User.rambodc.Bool_False_Delay"};




// **************************************************************
// 
// Ops.Json.RouteObject
// 
// **************************************************************

Ops.Json.RouteObject = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    NUM_PORTS = 10,
    DEFAULT_OBJECT = {},
    indexPort = op.inInt("index"),
    objectPort = op.inObject("Object in"),
    defaultObjectPort = op.inObject("default object", DEFAULT_OBJECT),
    objectPorts = createOutPorts(DEFAULT_OBJECT);

indexPort.onChange = objectPort.onChange = defaultObjectPort.onChange = update;

setDefaultValues();
update();

function createOutPorts()
{
    let arrayObjects = [];
    for (let i = 0; i < NUM_PORTS; i++)
    {
        let port = op.outObject("Index " + i + " Object");
        arrayObjects.push(port);
    }
    defaultObjectPort.set(null);
    return arrayObjects;
}

function setDefaultValues()
{
    let defaultValue = defaultObjectPort.get();

    objectPorts.forEach((port) => { return port.set(null); });
    if (defaultObjectPort.get())
    {
        objectPorts.forEach((port) => { return port.set(defaultValue); });
    }
}

function update()
{
    setDefaultValues();
    let index = indexPort.get();
    let value = objectPort.get();

    index = Math.floor(index);
    index = clamp(index, 0, NUM_PORTS - 1);
    objectPorts[index].setRef(value);
}

function clamp(value, min, max)
{
    return Math.min(Math.max(value, min), max);
}


};

Ops.Json.RouteObject.prototype = new CABLES.Op();
CABLES.OPS["bc969951-32b5-4226-9944-80a719a65497"]={f:Ops.Json.RouteObject,objName:"Ops.Json.RouteObject"};




// **************************************************************
// 
// Ops.Boolean.Or
// 
// **************************************************************

Ops.Boolean.Or = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    bool0 = op.inValueBool("bool 1"),
    bool1 = op.inValueBool("bool 2"),
    bool2 = op.inValueBool("bool 3"),
    bool3 = op.inValueBool("bool 4"),
    bool4 = op.inValueBool("bool 5"),
    bool5 = op.inValueBool("bool 6"),
    bool6 = op.inValueBool("bool 7"),
    bool7 = op.inValueBool("bool 8"),
    bool8 = op.inValueBool("bool 9"),
    bool9 = op.inValueBool("bool 10"),
    result = op.outBoolNum("result");

bool0.onChange =
    bool1.onChange =
    bool2.onChange =
    bool3.onChange =
    bool4.onChange =
    bool5.onChange =
    bool6.onChange =
    bool7.onChange =
    bool8.onChange =
    bool9.onChange = exec;

function exec()
{
    result.set(bool0.get() || bool1.get() || bool2.get() || bool3.get() || bool4.get() || bool5.get() || bool6.get() || bool7.get() || bool8.get() || bool9.get());
}


};

Ops.Boolean.Or.prototype = new CABLES.Op();
CABLES.OPS["b3b36238-4592-4e11-afe3-8361c4fd6be5"]={f:Ops.Boolean.Or,objName:"Ops.Boolean.Or"};




// **************************************************************
// 
// Ops.String.StringReplace
// 
// **************************************************************

Ops.String.StringReplace = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inStr = op.inString("String"),
    inSearch = op.inString("Search For", "foo"),
    inRepl = op.inString("Replace", "bar"),
    inWhat = op.inSwitch("Replace What", ["All", "First"], "All"),
    outStr = op.outString("Result");

inRepl.onChange =
inStr.onChange =
inWhat.onChange =
inSearch.onChange = update;

function update()
{
    op.setUiError("exception", null);

    let str = "";
    try
    {
        if (inWhat.get() == "All") str = String(inStr.get()).replace(new RegExp(inSearch.get(), "g"), inRepl.get());
        else str = String(inStr.get()).replace(inSearch.get(), inRepl.get());
    }
    catch (e)
    {
        op.setUiError("exception", "exception " + e.message);
    }

    outStr.set(str);
}


};

Ops.String.StringReplace.prototype = new CABLES.Op();
CABLES.OPS["4a053e7a-6b00-4e71-bd51-90cdb190994c"]={f:Ops.String.StringReplace,objName:"Ops.String.StringReplace"};




// **************************************************************
// 
// Ops.User.rambodc.security_checks
// 
// **************************************************************

Ops.User.rambodc.security_checks = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const inTrigger = op.inTriggerButton("Trigger");
const enableChecks = [
    op.inBool("Enable1", true),
    op.inBool("Enable2", true),
    op.inBool("Enable3", true),
    op.inBool("Enable4", true),
    op.inBool("Enable5", true),
    op.inBool("Enable6", true),
    op.inBool("Enable7", true),
    op.inBool("Enable8", true),
    op.inBool("Enable9", true),
    op.inBool("Enable10", true),
];
const inputStrings = [
    op.inString("Input1", ""),
    op.inString("Input2", ""),
    op.inString("Input3", ""),
    op.inString("Input4", ""),
    op.inString("Input5", ""),
    op.inString("Input6", ""),
    op.inString("Input7", ""),
    op.inString("Input8", ""),
    op.inString("Input9", ""),
    op.inString("Input10", ""),
];
const equalStrings = [
    op.inString("Equals1", ""),
    op.inString("Equals2", ""),
    op.inString("Equals3", ""),
    op.inString("Equals4", ""),
    op.inString("Equals5", ""),
    op.inString("Equals6", ""),
    op.inString("Equals7", ""),
    op.inString("Equals8", ""),
    op.inString("Equals9", ""),
    op.inString("Equals10", ""),
];
const errorMessages = [
    op.inString("Error1", ""),
    op.inString("Error2", ""),
    op.inString("Error3", ""),
    op.inString("Error4", ""),
    op.inString("Error5", ""),
    op.inString("Error6", ""),
    op.inString("Error7", ""),
    op.inString("Error8", ""),
    op.inString("Error9", ""),
    op.inString("Error10", ""),
];

// outputs
const outPass = op.outBool("Pass");
const outErrorMessage = op.outObject("Error Message");
const outErrorTriggers = [
    op.outTrigger("Error1 Trigger"),
    op.outTrigger("Error2 Trigger"),
    op.outTrigger("Error3 Trigger"),
    op.outTrigger("Error4 Trigger"),
    op.outTrigger("Error5 Trigger"),
    op.outTrigger("Error6 Trigger"),
    op.outTrigger("Error7 Trigger"),
    op.outTrigger("Error8 Trigger"),
    op.outTrigger("Error9 Trigger"),
    op.outTrigger("Error10 Trigger"),
];
const outTriggerTrue = op.outTrigger("Trigger True");
const outTriggerFalse = op.outTrigger("Trigger False");

inTrigger.onTriggered = checkInputs;

function checkInputs() {
    let pass = true;
    let errors = {};
    for (let i = 0; i < enableChecks.length; i++) {
        if (enableChecks[i].get() && inputStrings[i].get() !== equalStrings[i].get()) {
            pass = false;
            errors['Error' + (i + 1)] = errorMessages[i].get();
            outErrorTriggers[i].trigger();
        }
    }
    outPass.set(pass);
    outErrorMessage.set(errors);
    if (pass) {
        outTriggerTrue.trigger();
    } else {
        outTriggerFalse.trigger();
    }
}


};

Ops.User.rambodc.security_checks.prototype = new CABLES.Op();
CABLES.OPS["105817e6-2921-440c-b21b-4cca0f0771f5"]={f:Ops.User.rambodc.security_checks,objName:"Ops.User.rambodc.security_checks"};




// **************************************************************
// 
// Ops.User.rambodc.StringEquals_Triggers
// 
// **************************************************************

Ops.User.rambodc.StringEquals_Triggers = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const str1 = op.inString("String 1"),
    str2 = op.inString("String 2"),
    triggerCheckEquality = op.inTriggerButton("Check Equality");

// outputs
const result = op.outBoolNum("Result"),
    isEqualTrigger = op.outTrigger("True"),
    isNotEqualTrigger = op.outTrigger("False");

str1.onChange =
str2.onChange =
    function ()
    {
        result.set(str1.get() == str2.get());
    };

triggerCheckEquality.onTriggered =
    function ()
    {
        if(str1.get() == str2.get()) {
            isEqualTrigger.trigger();
        } else {
            isNotEqualTrigger.trigger();
        }
    };


};

Ops.User.rambodc.StringEquals_Triggers.prototype = new CABLES.Op();
CABLES.OPS["bf09a225-d7da-43cb-9b34-a457846defe2"]={f:Ops.User.rambodc.StringEquals_Triggers,objName:"Ops.User.rambodc.StringEquals_Triggers"};




// **************************************************************
// 
// Ops.User.rambodc.delay_boolean_timer
// 
// **************************************************************

Ops.User.rambodc.delay_boolean_timer = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
//inputs
const inTrigger = op.inTriggerButton("Trigger");
const inDelay = op.inFloat("Delay", 1);

//outputs
const outBoolean = op.outValueBool("Output Boolean", false);
const outTrigger = op.outTrigger("Output Trigger");

let timeoutId;

inTrigger.onTriggered = () => {
    clearTimeout(timeoutId); // Clear any existing timeout
    outBoolean.set(true); // Set the output to true immediately

    // Schedule a function to set the output back to false after the delay
    timeoutId = setTimeout(() => {
        if(outBoolean.get() == true){
            outBoolean.set(false);
            outTrigger.trigger();  // trigger the output when true changes to false
        }
    }, inDelay.get() * 1000);
}

inDelay.onChange = () => {
    // If the delay input changes, we need to adjust our timer
    if (timeoutId) {
        clearTimeout(timeoutId); // Clear the existing timeout
        // Schedule a function to set the output back to false after the new delay
        timeoutId = setTimeout(() => {
            if(outBoolean.get() == true){
                outBoolean.set(false);
                outTrigger.trigger();  // trigger the output when true changes to false
            }
        }, inDelay.get() * 1000);
    }
}


};

Ops.User.rambodc.delay_boolean_timer.prototype = new CABLES.Op();
CABLES.OPS["12e7e974-bd91-43b9-8d08-8ff77628aae6"]={f:Ops.User.rambodc.delay_boolean_timer,objName:"Ops.User.rambodc.delay_boolean_timer"};




// **************************************************************
// 
// Ops.User.rambodc.delay_Object
// 
// **************************************************************

Ops.User.rambodc.delay_Object = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    DEFAULT_OBJECT = {},
    objectInPort = op.inObject("Object in"),
    delayPort = op.inInt("Delay (ms)", 1000), // input for delay time in milliseconds
    objectOutPort = op.outObject("Object out");

let timeoutId = null; // store the ID of the setTimeout call

objectInPort.onChange = delayPort.onChange = update;

function update()
{
    let value = objectInPort.get();
    let delay = delayPort.get();

    // Clear any existing timeout
    if (timeoutId !== null) {
        clearTimeout(timeoutId);
    }

    // Use setTimeout to create a delay
    timeoutId = setTimeout(() => {
        objectOutPort.set(value);
    }, delay);
}


};

Ops.User.rambodc.delay_Object.prototype = new CABLES.Op();
CABLES.OPS["cef626d6-e8d8-4758-b1ed-6556d8402471"]={f:Ops.User.rambodc.delay_Object,objName:"Ops.User.rambodc.delay_Object"};




// **************************************************************
// 
// Ops.Trigger.IfEqualsThen
// 
// **************************************************************

Ops.Trigger.IfEqualsThen = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const exe = op.inTrigger("exe");
let value1 = op.inValue("Value 1", 0);
let value2 = op.inValue("Value 2", 0);

let triggerThen = op.addOutPort(new CABLES.Port(op, "then", CABLES.OP_PORT_TYPE_FUNCTION));
let triggerElse = op.addOutPort(new CABLES.Port(op, "else", CABLES.OP_PORT_TYPE_FUNCTION));

function exec()
{
    if (value1.get() == value2.get())
    {
        triggerThen.trigger();
    }
    else
    {
        triggerElse.trigger();
    }
}

exe.onTriggered = exec;


};

Ops.Trigger.IfEqualsThen.prototype = new CABLES.Op();
CABLES.OPS["e8196d70-d0a6-470a-9448-a7ac0c0e956e"]={f:Ops.Trigger.IfEqualsThen,objName:"Ops.Trigger.IfEqualsThen"};




// **************************************************************
// 
// Ops.User.rambodc.button_Icon
// 
// **************************************************************

Ops.User.rambodc.button_Icon = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const iconPort = op.inString("Icon", "https://firebasestorage.googleapis.com/v0/b/cables-5b10a.appspot.com/o/assets%2FAccountsNodes.png?alt=media&token=36471c6c-5487-491f-ac31-76eddf2abd5d");
const buttonTextPort = op.inString("Text", "Button");
const rightTextPort = op.inString("Text Right", "Button");
const rightIconPort = op.inString("Icon Right","https://firebasestorage.googleapis.com/v0/b/cables-5b10a.appspot.com/o/assets%2Fright-arrow%20(1).png?alt=media&token=d86bbe34-2ced-42f6-b4e4-7f5d752ff5f1");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.style.height = "60px";
el.style.display = "flex";
el.style.justifyContent = "space-between";
el.style.alignItems = "center";
el.style.backgroundColor = "transparent";
el.style.cursor = "pointer";
el.style.padding = "10px 10px";
el.style.transition = "background-color 0.3s, border-color 0.3s";
el.style.fontSize = "16px";
el.style.color = "white";
el.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
el.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";

const leftContainer = document.createElement("div");
leftContainer.style.display = "flex";
leftContainer.style.alignItems = "center";
el.appendChild(leftContainer);

const leftIcon = document.createElement("img");
leftIcon.src = iconPort.get();
leftIcon.style.width = "50px";
leftIcon.style.height = "50px";
leftIcon.style.padding = "10px";
leftContainer.appendChild(leftIcon);

const input = document.createElement("div");
input.style.textAlign = "left";
input.style.fontSize = "16px";
input.style.lineHeight = "1";
leftContainer.appendChild(input);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);

const rightContainer = document.createElement("div");
rightContainer.style.display = "flex";
rightContainer.style.alignItems = "center";
el.appendChild(rightContainer);

const rightText = document.createElement("div");
rightText.innerText = rightTextPort.get();
rightText.style.fontWeight = "bold";
rightText.style.fontSize = "16px";
rightText.style.lineHeight = "1";
rightContainer.appendChild(rightText);

const rightIcon = document.createElement("img");
rightIcon.src = rightIconPort.get();
rightIcon.style.width = "20px";
rightIcon.style.height = "20px";
rightIcon.style.padding = "0 10px";
rightContainer.appendChild(rightIcon);

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// Attach click event to the entire button
el.addEventListener("click", onButtonClick);
el.addEventListener("mouseenter", onButtonMouseEnter);
el.addEventListener("mouseleave", onButtonMouseLeave);

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
iconPort.onChange = updateIcon;
rightTextPort.onChange = updateRightText;
rightIconPort.onChange = updateRightIcon;
op.onDelete = onDelete;
inVisible.onChange = updateVisibility;

function onButtonClick() {
    buttonPressedPort.trigger();
    el.style.borderColor = "rgba(255, 255, 255, 0.3)";
}

function onButtonMouseEnter() {
    el.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
    el.style.color = "rgba(255, 255, 255, 0.9)";
    el.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    el.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
}

function onButtonMouseLeave() {
    el.style.backgroundColor = "transparent";
    el.style.color = "rgba(255, 255, 255, 0.9)";
    el.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    el.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
}

function onButtonTextChanged() {
    input.textContent = buttonTextPort.get();
    if (CABLES.UI) {
        op.setTitle("Button: " + buttonTextPort.get());
    }
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else { // detach
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function updateIcon() {
    leftIcon.src = iconPort.get();
}

function updateRightText() {
    rightText.innerText = rightTextPort.get();
}

function updateRightIcon() {
    rightIcon.src = rightIconPort.get();
}

function updateVisibility() {
    el.style.display = inVisible.get() ? "flex" : "none";
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.button_Icon.prototype = new CABLES.Op();
CABLES.OPS["e2e2f70c-0496-455c-8868-675cf1fe9f51"]={f:Ops.User.rambodc.button_Icon,objName:"Ops.User.rambodc.button_Icon"};




// **************************************************************
// 
// Ops.User.rambodc.SidebarText_Title
// 
// **************************************************************

Ops.User.rambodc.SidebarText_Title = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");  // new input trigger "Clear"
const inVisible = op.inBool("Visible", true);  // new input for visibility

// outputs
const siblingsPort = op.outObject("childs");

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");


const label = document.createElement("div");
label.classList.add("sidebar__item-label");

// CSS properties
label.style.fontWeight = "bold";  // set font weight to bold
label.style.fontSize = "20px";  // set font size
label.style.textAlign = "left";  // align text to left
label.style.margin = "2px";  // set margin
label.style.padding = "2px";  // set padding

const labelText = document.createElement("div");
label.appendChild(labelText);
el.appendChild(label);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;  // new event handler for "Clear" trigger
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;  // new event handler for visibility change

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// functions
function onVisibilityChanged() {  // new function to handle visibility change
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() { // new function to handle "Clear" trigger
    labelPort.set(''); // clear the "Text" input
    onLabelTextChanged(); // update label text
}

function onIdChanged() {
    el.id = inId.get();
}

function onLabelTextChanged() {
    const labelText = labelPort.get();
    label.innerHTML = labelText;
    if (CABLES.UI) {
        if (labelText && typeof labelText === "string") {
            op.setTitle("Text: " + labelText.substring(0, 10)); // display first 10 characters of text in op title
        } else {
            op.setTitle("Text");
        }
    }
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else { // detach
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.SidebarText_Title.prototype = new CABLES.Op();
CABLES.OPS["921dabde-3865-4889-89f5-1ab8ec65e6ba"]={f:Ops.User.rambodc.SidebarText_Title,objName:"Ops.User.rambodc.SidebarText_Title"};




// **************************************************************
// 
// Ops.User.rambodc.Button_Back
// 
// **************************************************************

Ops.User.rambodc.Button_Back = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");

const input = document.createElement("div");
input.classList.add("sidebar__button-input-back");
el.appendChild(input);
input.addEventListener("click", onButtonClick);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;
op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(el)
{
    if (el)
    {
        el.style.display = "block";
    }
}

function hideElement(el)
{
    if (el)
    {
        el.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_Back.prototype = new CABLES.Op();
CABLES.OPS["b7722f22-8ead-4479-a047-0ecb8720bb18"]={f:Ops.User.rambodc.Button_Back,objName:"Ops.User.rambodc.Button_Back"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_FundWallet
// 
// **************************************************************

Ops.User.rambodc.XRPL_FundWallet = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const inTrigger = op.inTriggerButton("Trigger In");
const inWallet = op.inObject("Wallet");
const inWss = op.inString("Wss");
const inAmount = op.inString("Amount", "1000");

const outFundWallet = op.outObject("Fund Wallet");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");
const outError = op.outString("Error");
const outMissingWss = op.outBool("Missing Wss");

inTrigger.onTriggered = main;

let client = null;

async function main() {

  if (!inWss.get()) {
    outError.set(true);
    outMissingWss.set(true);
    outFailure.trigger();
    return;
  }
  try {
    if (client === null) {
      client = new xrpl.Client(inWss.get());
      await client.connect();
    }

    let wallet;

    if (inWallet.get()) {
      wallet = await client.fundWallet(inWallet.get(), { amount: inAmount.get() });
    } else {
      wallet = await client.fundWallet(null, {
        amount: inAmount.get(),
      });
    }

    outFundWallet.set(wallet);
    outSuccess.trigger();
  } catch (error) {

    outError.set(error);
    outFailure.trigger();
  }
}


};

Ops.User.rambodc.XRPL_FundWallet.prototype = new CABLES.Op();
CABLES.OPS["a09799a9-fc66-47eb-801d-4c3de4a33769"]={f:Ops.User.rambodc.XRPL_FundWallet,objName:"Ops.User.rambodc.XRPL_FundWallet"};




// **************************************************************
// 
// Ops.User.rambodc.StringCompose3
// 
// **************************************************************

Ops.User.rambodc.StringCompose3 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    format=op.inString('Format',"hello $a, $b $c und $d $e $f $g $h $i $j $k $l $m $n $o $p $q $r $s $t $u $v"),
    a=op.inString('String A'),
    b=op.inString('String B'),
    c=op.inString('String C'),
    d=op.inString('String D'),
    e=op.inString('String E'),
    f=op.inString('String F'),
    g=op.inString('String G'),
    h=op.inString('String H'),
    i=op.inString('String I'),
    j=op.inString('String J'),
    k=op.inString('String K'),
    l=op.inString('String L'),
    m=op.inValue('Number M'),
    n=op.inValue('Number N'),
    o=op.inValue('Number O'),
    p=op.inValue('Number P'),
    q=op.inValue('Number Q'),
    r=op.inValue('Number R'),
    s=op.inValue('Number S'),
    t=op.inValue('Number T'),
    u=op.inValue('Number U'),
    v=op.inValue('Number V'),
    result=op.outString("Result");

format.onChange=
    a.onChange=
    b.onChange=
    c.onChange=
    d.onChange=
    e.onChange=
    f.onChange=
    g.onChange=
    h.onChange=
    i.onChange=
    j.onChange=
    k.onChange=
    l.onChange=
    m.onChange=
    n.onChange=
    o.onChange=
    p.onChange=
    q.onChange=
    r.onChange=
    s.onChange=
    t.onChange=
    u.onChange=
    v.onChange=update;

update();

function update()
{
    var str=format.get()||'';
    if(typeof str!='string')
        str='';

    str = str.replace(/\$a/g, a.get());
    str = str.replace(/\$b/g, b.get());
    str = str.replace(/\$c/g, c.get());
    str = str.replace(/\$d/g, d.get());
    str = str.replace(/\$e/g, e.get());
    str = str.replace(/\$f/g, f.get());
    str = str.replace(/\$g/g, g.get());
    str = str.replace(/\$h/g, h.get());
    str = str.replace(/\$i/g, i.get());
    str = str.replace(/\$j/g, j.get());
    str = str.replace(/\$k/g, k.get());
    str = str.replace(/\$l/g, l.get());
    str = str.replace(/\$m/g, m.get().toString());
    str = str.replace(/\$n/g, n.get().toString());
    str = str.replace(/\$o/g, o.get().toString());
    str = str.replace(/\$p/g, p.get().toString());
    str = str.replace(/\$q/g, q.get().toString());
    str = str.replace(/\$r/g, r.get().toString());
    str = str.replace(/\$s/g, s.get().toString());
    str = str.replace(/\$t/g, t.get().toString());
    str = str.replace(/\$u/g, u.get().toString());
    str = str.replace(/\$v/g, v.get().toString());

    result.set(str);
}


};

Ops.User.rambodc.StringCompose3.prototype = new CABLES.Op();
CABLES.OPS["30179933-bbce-4110-a53f-84d586531595"]={f:Ops.User.rambodc.StringCompose3,objName:"Ops.User.rambodc.StringCompose3"};




// **************************************************************
// 
// Ops.User.rambodc.FBSetDocument
// 
// **************************************************************

Ops.User.rambodc.FBSetDocument = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
//input
const inTrigger = op.inTriggerButton("Trigger");
const inCollectionName = op.inString("Collection name");
const inDocumentID = op.inString("Document ID");
const inSubCollectionName = op.inString("SubCollection name");
const inSubDocumentID = op.inString("SubDocument ID");
const inDocument = op.inObject("Document");
const inMerge = op.inBool("Merge",false);
const inCreateTimestamp = op.inBool("Create Timestamp");

//output
const outError = op.outBoolNum("Error",false);
const outErrorMessage = op.outString("Error Message");
const outCreatedDocument = op.outObject("Created Document");
const outCreatedDocumentID = op.outString("Created Document ID");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");

inTrigger.onTriggered = createDocument;

function createDocument() {
  if (!inCollectionName.get() || !inDocument.get()) {
    outError.set(true);
    outErrorMessage.set("Missing Arguments: Collection name, Document ID or Document is missing!");
    return;
  }

  const db = firebase.firestore();
  let docRef = db.collection(inCollectionName.get()).doc(inDocumentID.get());

  // if sub collection name and sub document ID are provided, use them
  if (inSubCollectionName.get() && inSubDocumentID.get()) {
    docRef = docRef.collection(inSubCollectionName.get()).doc(inSubDocumentID.get());
  }

  let documentToCreate = inDocument.get();

  // If the 'createdAt' field exists in the document and the inCreateTimestamp is false, remove it
  if (!inCreateTimestamp.get() && documentToCreate.hasOwnProperty('createdAt')) {
    delete documentToCreate.createdAt;
  }

  // If the inCreateTimestamp is true, add the 'createdAt' field with the timestamp
  if (inCreateTimestamp.get()) {
    documentToCreate.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }

  docRef.set(documentToCreate, { merge: inMerge.get() })
    .then(() => {
      outError.set(false);
      outErrorMessage.set("");
      outCreatedDocument.set(documentToCreate);
      outCreatedDocumentID.set(inDocumentID.get());
      outSuccess.trigger();
    })
    .catch((error) => {
      outError.set(true);
      outCreatedDocument.set(null);
      outCreatedDocumentID.set(null);
      outErrorMessage.set(error.message);
      outFailure.trigger();
    });
}


};

Ops.User.rambodc.FBSetDocument.prototype = new CABLES.Op();
CABLES.OPS["1afeecfc-d970-4b11-901d-c54753a0c32a"]={f:Ops.User.rambodc.FBSetDocument,objName:"Ops.User.rambodc.FBSetDocument"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_account_info
// 
// **************************************************************

Ops.User.rambodc.XRPL_account_info = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs
const inTrigger = op.inTriggerButton("Trigger");
const inAccount = op.inString("Account");
const inLedgerIndex = op.inString("Ledger Index", "current"); // default to 'current'
const inWSS = op.inString("WebSocket Server (WSS)");

// Outputs
const outObject = op.outObject("Account Info");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");
const outError = op.outString("Error");

// Run the main function when the trigger input is activated
inTrigger.onTriggered = main;

async function main() {
  const account = inAccount.get();
  const ledgerIndex = inLedgerIndex.get();
  const wssURL = inWSS.get();

  // Construct the request payload
  const payload = {
    command: "account_info",
    account: account,
    ledger_index: ledgerIndex,
    strict: true,
    queue: true
  };

  // Make the WebSocket connection and send the request
  const socket = new WebSocket(wssURL);

  socket.onopen = () => {
    socket.send(JSON.stringify(payload));
  };

  socket.onmessage = (event) => {
    const data = JSON.parse(event.data);
    // Check for errors
    if (data.error) {
      outError.set(data.error + ": " + data.error_message);
      outFailure.trigger();
      return;
    }

    // Output the account info
    outObject.set(data);
    outSuccess.trigger();
  };

  socket.onerror = (error) => {
    outError.set("WebSocket error: " + error.message);
    outFailure.trigger();
  };

  socket.onclose = (event) => {
    if (!event.wasClean) {
      outError.set(`WebSocket connection closed unexpectedly: code ${event.code} reason ${event.reason}`);
      outFailure.trigger();
    }
  };
}


};

Ops.User.rambodc.XRPL_account_info.prototype = new CABLES.Op();
CABLES.OPS["827f42e0-2827-4691-b40a-60db765a8fec"]={f:Ops.User.rambodc.XRPL_account_info,objName:"Ops.User.rambodc.XRPL_account_info"};




// **************************************************************
// 
// Ops.User.rambodc.Test2
// 
// **************************************************************

Ops.User.rambodc.Test2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// input
const inCurrentObject = op.inObject("Current Object");
const inNewBalance = op.inObject("New Balance");
const inUpdateInbox = op.inTriggerButton("Update Inbox");

// output
const outUpdatedObject = op.outObject("Output Object");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");

// helper function to deep copy an object
function deepCopy(obj) {
    return JSON.parse(JSON.stringify(obj));
}

// event handler
inUpdateInbox.onTriggered = updateInbox;

function updateInbox() {
    // deep copy the current object to avoid mutating the original
    let currentObject = deepCopy(inCurrentObject.get());

    // get new balance object
    let newBalance = inNewBalance.get();

    if (typeof currentObject !== 'object' || currentObject === null || typeof newBalance !== 'object' || newBalance === null) {
        outFailure.trigger();
        return;
    }

    // check if the balances field exists in the current object
    if (!currentObject.balances) {
        currentObject.balances = {};
    }

    // check if the inbox field exists in the current object
    if (!currentObject.inbox) {
        currentObject.inbox = {};
    }

    // update balances and inbox
    for (let currency in newBalance) {
        if (newBalance.hasOwnProperty(currency)) {
            let balanceObject = deepCopy(newBalance[currency]);

            // update the balances
            currentObject.balances[currency] = balanceObject;

            // update the inbox
            if (!currentObject.inbox[currency]) {
                currentObject.inbox[currency] = balanceObject;
            } else {
                currentObject.inbox[currency].balance += balanceObject.balance;
            }
        }
    }

    // output the updated object
    outUpdatedObject.set(currentObject);
    outSuccess.trigger();
}


};

Ops.User.rambodc.Test2.prototype = new CABLES.Op();
CABLES.OPS["8c71ea4b-ebcd-4711-9658-89e8fc29e356"]={f:Ops.User.rambodc.Test2,objName:"Ops.User.rambodc.Test2"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_account_tx
// 
// **************************************************************

Ops.User.rambodc.XRPL_account_tx = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};

const inTrigger = op.inTriggerButton("Trigger In");
const inWss = op.inString("WSS URL");
const inAddress = op.inString("XRPL Address");
const inLedgerIndexMin = op.inValue("Ledger Index Min", -1, { label: "Leave blank for earliest validated ledger" });
const inLedgerIndexMax = op.inValue("Ledger Index Max", -1, { label: "Leave blank for most recent validated ledger" });
const inLimit = op.inValue("Limit", 10, { min: 1, max: 100 });
const inBinary = op.inBool("Binary", false);
const inMarker = op.inObject("Marker In", {}, { label: "Input the Marker object from the last response for pagination" });

const outAccountTx = op.outObject("Account TX");
const outMarker = op.outObject("Marker Out");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");
const outError = op.outString("Error");
const outMissingFields = op.outBool("Missing Fields");

inTrigger.onTriggered = main;
let client = null;

async function main() {
  // Check if required fields are missing
  if (!inWss.get() || !inAddress.get()) {
    outError.set("Missing fields");
    outMissingFields.set(true);
    outFailure.trigger();
    return;
  }

  // Define the network client
  try {
    if (client === null) {
      client = new xrpl.Client(inWss.get());
      await client.connect();
    }

    // Build account_tx request parameters
    const requestParams = {
      command: "account_tx",
      account: inAddress.get(),
      limit: inLimit.get(),
      binary: inBinary.get()
    };

    // If marker exists, add it to the request params
    if (Object.keys(inMarker.get()).length !== 0) {
      requestParams.marker = inMarker.get();
    }

    if (inLedgerIndexMin.get() !== -1) {
      requestParams.ledger_index_min = inLedgerIndexMin.get();
    }

    if (inLedgerIndexMax.get() !== -1) {
      requestParams.ledger_index_max = inLedgerIndexMax.get();
    }

    // Fetch account transactions using account_tx API
    const accountTx = await client.request(requestParams);

    outAccountTx.set(accountTx);
    outMarker.set(accountTx.result.marker); // Save the marker for the next request
    outSuccess.trigger();
  } catch (error) {
    outError.set(error.message);
    outFailure.trigger();
  } finally {
    if (client !== null) {
      client.disconnect();
      client = null;
    }
  }
}


};

Ops.User.rambodc.XRPL_account_tx.prototype = new CABLES.Op();
CABLES.OPS["4ccd9205-f1be-46c1-bae2-f7dad0b5da4e"]={f:Ops.User.rambodc.XRPL_account_tx,objName:"Ops.User.rambodc.XRPL_account_tx"};




// **************************************************************
// 
// Ops.User.rambodc.FBAddDocument
// 
// **************************************************************

Ops.User.rambodc.FBAddDocument = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
//input
const inTrigger = op.inTriggerButton("Trigger");
const inCollectionName = op.inString("Collection name");
const inDocument = op.inObject("Document");
const inCreateTimestamp = op.inBool("Create Timestamp");

//output
const outError = op.outBoolNum("Error",false);
const outErrorMessage = op.outString("Error Message");
const outCreatedDocument = op.outObject("Created Document");
const outCreatedDocumentID = op.outString("Created Document ID");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");

inTrigger.onTriggered=createDocument;

function createDocument() {
  if (!inCollectionName.get() || !inDocument.get()) {
    outError.set(true);
    outErrorMessage.set("Missing Arguments: Collection name or Document is missing!");
    return;
  }

  const db = firebase.firestore();
  let colRef = db.collection(inCollectionName.get());

  let documentToCreate = inDocument.get();

  if (inCreateTimestamp.get()) {
    documentToCreate.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }

  colRef
    .add(documentToCreate)
    .then((docRef) => {
        outError.set(false);
        outErrorMessage.set("");
        outCreatedDocument.set(documentToCreate);
        outCreatedDocumentID.set(docRef.id);
        outSuccess.trigger();
    })
    .catch((error) => {
        outError.set(true);
        outCreatedDocument.set(null);
        outCreatedDocumentID.set(null);
        outErrorMessage.set(error.message);
        outFailure.trigger();
    });
}


};

Ops.User.rambodc.FBAddDocument.prototype = new CABLES.Op();
CABLES.OPS["7c17d7ea-69b7-4384-a276-71077b367fed"]={f:Ops.User.rambodc.FBAddDocument,objName:"Ops.User.rambodc.FBAddDocument"};




// **************************************************************
// 
// Ops.Sidebar.DropDown_v2
// 
// **************************************************************

Ops.Sidebar.DropDown_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inString("Text", "Value");
const valuesPort = op.inArray("Values");
const defaultValuePort = op.inString("Default", "");
const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);
const inSize = op.inInt("Lines", 1);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
setDefaultValueButtonPort.onTriggered = setDefault;

// outputs
const siblingsPort = op.outObject("Children");
const valuePort = op.outString("Result", defaultValuePort.get());
const outIndex = op.outNumber("Index");

defaultValuePort.setUiAttribs({ "title": "Input" });

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    valuePort.set(defaultValuePort.get());
    const optionElements = input.querySelectorAll("option");
    optionElements.forEach(function (optionElement, index)
    {
        if (optionElement.value.trim() === defaultValuePort.get())
        {
            optionElement.selected = true;
            outIndex.set(index);
        }
        else
        {
            optionElement.removeAttribute("selected");
        }
    });
});

el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__select");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelText = document.createTextNode(labelPort.get());
label.appendChild(labelText);
el.appendChild(label);
const input = document.createElement("select");

input.classList.add("sidebar__select-select");
el.appendChild(input);
input.addEventListener("input", onInput);

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
valuesPort.onChange = onValuesPortChange;

let options = [];
// functions

inSize.onChange = () =>
{
    input.setAttribute("size", inSize.get());
};

op.onLoaded = function ()
{
    valuePort.set(defaultValuePort.get());
};

function onValuesPortChange()
{
    // remove all children
    while (input.lastChild)
    {
        input.removeChild(input.lastChild);
    }
    options = valuesPort.get();
    const defaultValue = defaultValuePort.get();
    if (options)
    {
        options.forEach(function (option)
        {
            const optionEl = document.createElement("option");

            optionEl.setAttribute("value", option);
            if (option === defaultValue || option === valuePort.get())
            {
                optionEl.setAttribute("selected", "");
            }
            const textEl = document.createTextNode(option);
            optionEl.appendChild(textEl);
            input.appendChild(optionEl);
        });
    }
    else
    {
        valuePort.set("");
    }

    outIndex.set(0);
    setSelectedProperty(); /* set the selected property for the default value */
}

let finalIndex = 0;
function setSelectedProperty(defaultinput)
{
    const optionElements = input.querySelectorAll("option");

    let finalEle = null;

    optionElements.forEach(function (optionElement, index)
    {
        if (optionElement.value.trim() === valuePort.get())
        {
            finalEle = optionElement;
            finalIndex = index;
        }
        optionElement.removeAttribute("selected");
    });

    if (defaultinput)
    {
        const defaultItem = defaultValuePort.get() + "".trim();

        optionElements.forEach(function (optionElement, index)
        {
            if (optionElement.value.trim() === defaultItem)
            {
                finalEle = optionElement;
                finalIndex = index;
            }

            optionElement.removeAttribute("selected");
        });
    }

    if (finalEle) finalEle.setAttribute("selected", "");
    outIndex.set(finalIndex);
}

function onInput(ev)
{
    valuePort.set(ev.target.value);
    outIndex.set(options.indexOf(ev.target.value));
    setSelectedProperty();
}

function onDefaultValueChanged()
{
    const defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
    setSelectedProperty();
}

function onLabelTextChanged()
{
    const lblText = labelPort.get();
    label.textContent = lblText;
    if (CABLES.UI)
    {
        op.setTitle("Dropdown: " + lblText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(ele)
{
    if (ele)
    {
        ele.style.display = "block";
    }
    setSelectedProperty();
}

function hideElement(ele)
{
    if (ele)
    {
        ele.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(ele)
{
    if (ele && ele.parentNode && ele.parentNode.removeChild)
    {
        ele.parentNode.removeChild(ele);
    }
}

function setDefault()
{
    defaultValuePort.set(input.value);
    op.refreshParams();
}


};

Ops.Sidebar.DropDown_v2.prototype = new CABLES.Op();
CABLES.OPS["7b3f93d6-4de1-41fd-aa26-e74c8285c662"]={f:Ops.Sidebar.DropDown_v2,objName:"Ops.Sidebar.DropDown_v2"};




// **************************************************************
// 
// Ops.Value.Number
// 
// **************************************************************

Ops.Value.Number = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    v = op.inValueFloat("value"),
    result = op.outNumber("result");

v.onChange = exec;

function exec()
{
    result.set(Number(v.get()));
}


};

Ops.Value.Number.prototype = new CABLES.Op();
CABLES.OPS["8fb2bb5d-665a-4d0a-8079-12710ae453be"]={f:Ops.Value.Number,objName:"Ops.Value.Number"};




// **************************************************************
// 
// Ops.String.CopyToClipboard
// 
// **************************************************************

Ops.String.CopyToClipboard = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inCopy= op.inTriggerButton("Copy"),
    inStr=op.inString("String","cablez");

inCopy.onTriggered=()=>
{
    navigator.clipboard.writeText(inStr.get());
};


};

Ops.String.CopyToClipboard.prototype = new CABLES.Op();
CABLES.OPS["283c7eef-680b-45f2-880a-5d9f0762854b"]={f:Ops.String.CopyToClipboard,objName:"Ops.String.CopyToClipboard"};




// **************************************************************
// 
// Ops.User.rambodc.String_to_Number
// 
// **************************************************************

Ops.User.rambodc.String_to_Number = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const inString = op.inString("String to convert", "0");

// outputs
const outNumber = op.outNumber("Number");

// events
inString.onChange = onStringChanged;

// function
function onStringChanged() {
    // Parse the string to a number and output it
    const number = parseFloat(inString.get());
    if (isNaN(number)) {
        console.error("Invalid number string: ", inString.get());
        return;
    }
    outNumber.set(number);
}


};

Ops.User.rambodc.String_to_Number.prototype = new CABLES.Op();
CABLES.OPS["03750bb8-fab9-45ac-95c4-3833ff0a8489"]={f:Ops.User.rambodc.String_to_Number,objName:"Ops.User.rambodc.String_to_Number"};




// **************************************************************
// 
// Ops.Math.Round
// 
// **************************************************************

Ops.Math.Round = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    number1 = op.inValueFloat("number"),
    decPlaces = op.inInt("Decimal Places", 0),
    result = op.outNumber("result");

let decm = 0;

number1.onChange = exec;
decPlaces.onChange = updateDecm;

updateDecm();

function updateDecm()
{
    decm = Math.pow(10, decPlaces.get());
    exec();
}

function exec()
{
    result.set(Math.round(number1.get() * decm) / decm);
}


};

Ops.Math.Round.prototype = new CABLES.Op();
CABLES.OPS["1a1ef636-6d02-42ba-ae1e-627b917d0d2b"]={f:Ops.Math.Round,objName:"Ops.Math.Round"};




// **************************************************************
// 
// Ops.User.rambodc.Sidebar_Text_customize
// 
// **************************************************************

Ops.User.rambodc.Sidebar_Text_customize = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");
const inVisible = op.inBool("Visible", true);
const isButton = op.inBool("Button", false);
// Inputs for CSS customization
const textColor = op.inString("Text Color", "rgba(255,255,255,1)");
const textSize = op.inString("Text Size", "16px");
const lineHeight = op.inString("Line Height", "1.5");
const isBold = op.inBool("Bold", false);
const backgroundColor = op.inString("Background Color", "rgba(255,255,255,0.1)");
const hoverColor = op.inString("Hover Color", "rgba(255,255,255,0.3)");  // New input for hover color
const margin = op.inString("Margin", "10px");
const padding = op.inString("Padding", "10px");
const height = op.inString("Height", "auto");
const width = op.inString("Width", "auto");
const textAlign = op.inString("Text Align", "left");

// Outputs
const siblingsPort = op.outObject("childs");
const clickTrigger = op.outTrigger("Clicked");

// Variables
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
const label = document.createElement("div");
label.classList.add("sidebar__item-label-v2");
const labelText = document.createElement("div");
label.appendChild(labelText);
el.appendChild(label);

// Event listeners
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;
isButton.onChange = onButtonChanged;

// New event listeners for CSS customization
textColor.onChange = applyStyles;
textSize.onChange = applyStyles;
lineHeight.onChange = applyStyles;
isBold.onChange = applyStyles;
backgroundColor.onChange = applyStyles;
hoverColor.onChange = applyStyles;  // New event listener for hover color change
margin.onChange = applyStyles;
padding.onChange = applyStyles;
height.onChange = applyStyles;
width.onChange = applyStyles;
textAlign.onChange = applyStyles; // New event listener for text alignment change

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// Functions
function applyStyles() {
    label.style.color = textColor.get();
    label.style.fontSize = textSize.get();
    label.style.lineHeight = lineHeight.get();
    label.style.fontWeight = isBold.get() ? "bold" : "normal";
    el.style.backgroundColor = backgroundColor.get();
    el.style.margin = margin.get();
    el.style.padding = padding.get();
    el.style.height = height.get();
    el.style.width = width.get();
    label.style.textAlign = textAlign.get(); // Apply text alignment
    if (isButton.get()) {
        el.style.cursor = 'pointer';
        el.style.transition = 'background-color 0.3s';
    } else {
        el.style.cursor = 'default';
    }
}

function onVisibilityChanged() {
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() {
    labelPort.set('');
    onLabelTextChanged();
}

function onIdChanged() {
    el.id = inId.get();
}

function onLabelTextChanged() {
    const labelText = labelPort.get();
    label.innerHTML = labelText;
    if (CABLES.UI) {
        if (labelText && typeof labelText === "string") {
            op.setTitle("Text: " + labelText.substring(0, 10));
        } else {
            op.setTitle("Text");
        }
    }
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onButtonChanged() {
    if (isButton.get()) {
        el.addEventListener('click', onClicked);
        el.addEventListener('mouseover', onMouseOver);
        el.addEventListener('mouseout', onMouseOut);
    } else {
        el.removeEventListener('click', onClicked);
        el.removeEventListener('mouseover', onMouseOver);
        el.removeEventListener('mouseout', onMouseOut);
    }
    applyStyles();
}

function onClicked() {
    clickTrigger.trigger();
}

function onMouseOver() {  // New function to handle mouseover event
    el.style.backgroundColor = hoverColor.get();
}

function onMouseOut() {  // New function to handle mouseout event
    el.style.backgroundColor = backgroundColor.get();
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Sidebar_Text_customize.prototype = new CABLES.Op();
CABLES.OPS["4d16ae29-1e59-489c-b582-14213a3f4ff6"]={f:Ops.User.rambodc.Sidebar_Text_customize,objName:"Ops.User.rambodc.Sidebar_Text_customize"};




// **************************************************************
// 
// Ops.Json.ObjectToArray
// 
// **************************************************************

Ops.Json.ObjectToArray = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const inObj = op.inObject("Object");
const outArray = op.outArray("Array");

inObj.onChange = function ()
{
    outArray.set(inObj.get());
};


};

Ops.Json.ObjectToArray.prototype = new CABLES.Op();
CABLES.OPS["f8ac4574-ffe3-4618-a27f-30d190308e2c"]={f:Ops.Json.ObjectToArray,objName:"Ops.Json.ObjectToArray"};




// **************************************************************
// 
// Ops.User.rambodc.Check_String_Equals_Number
// 
// **************************************************************

Ops.User.rambodc.Check_String_Equals_Number = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    incomingString = op.inString("Incoming String"),
    unknownResult = op.inInt("Unknown Result", 0),
    enabled1 = op.inBool("1 Enabled"),
    stringEquals1 = op.inString("1 String Equals"),
    result1 = op.inInt("1 Result"),
    enabled2 = op.inBool("2 Enabled"),
    stringEquals2 = op.inString("2 String Equals"),
    result2 = op.inInt("2 Result"),
    enabled3 = op.inBool("3 Enabled"),
    stringEquals3 = op.inString("3 String Equals"),
    result3 = op.inInt("3 Result"),
    enabled4 = op.inBool("4 Enabled"),
    stringEquals4 = op.inString("4 String Equals"),
    result4 = op.inInt("4 Result"),
    enabled5 = op.inBool("5 Enabled"),
    stringEquals5 = op.inString("5 String Equals"),
    result5 = op.inInt("5 Result"),
    enabled6 = op.inBool("6 Enabled"),
    stringEquals6 = op.inString("6 String Equals"),
    result6 = op.inInt("6 Result"),
    enabled7 = op.inBool("7 Enabled"),
    stringEquals7 = op.inString("7 String Equals"),
    result7 = op.inInt("7 Result"),
    enabled8 = op.inBool("8 Enabled"),
    stringEquals8 = op.inString("8 String Equals"),
    result8 = op.inInt("8 Result"),
    enabled9 = op.inBool("9 Enabled"),
    stringEquals9 = op.inString("9 String Equals"),
    result9 = op.inInt("9 Result"),
    enabled10 = op.inBool("10 Enabled"),
    stringEquals10 = op.inString("10 String Equals"),
    result10 = op.inInt("10 Result"),
    enabled11 = op.inBool("11 Enabled"),
    stringEquals11 = op.inString("11 String Equals"),
    result11 = op.inInt("11 Result"),
    enabled12 = op.inBool("12 Enabled"),
    stringEquals12 = op.inString("12 String Equals"),
    result12 = op.inInt("12 Result"),
    enabled13 = op.inBool("13 Enabled"),
    stringEquals13 = op.inString("13 String Equals"),
    result13 = op.inInt("13 Result"),
    enabled14 = op.inBool("14 Enabled"),
    stringEquals14 = op.inString("14 String Equals"),
    result14 = op.inInt("14 Result"),
    enabled15 = op.inBool("15 Enabled"),
    stringEquals15 = op.inString("15 String Equals"),
    result15 = op.inInt("15 Result"),
    resultNumber = op.outNumber("Result Number"),
    triggerOut = op.outTrigger("Trigger");

function checkString() {
    let inStr = incomingString.get();
    let res = unknownResult.get();
    let checks = [
        {enabled: enabled1.get(), equals: stringEquals1.get(), result: result1.get()},
        {enabled: enabled2.get(), equals: stringEquals2.get(), result: result2.get()},
        {enabled: enabled3.get(), equals: stringEquals3.get(), result: result3.get()},
        {enabled: enabled4.get(), equals: stringEquals4.get(), result: result4.get()},
        {enabled: enabled5.get(), equals: stringEquals5.get(), result: result5.get()},
        {enabled: enabled6.get(), equals: stringEquals6.get(), result: result6.get()},
        {enabled: enabled7.get(), equals: stringEquals7.get(), result: result7.get()},
        {enabled: enabled8.get(), equals: stringEquals8.get(), result: result8.get()},
        {enabled: enabled9.get(), equals: stringEquals9.get(), result: result9.get()},
        {enabled: enabled10.get(), equals: stringEquals10.get(), result: result10.get()},
        {enabled: enabled11.get(), equals: stringEquals11.get(), result: result11.get()},
        {enabled: enabled12.get(), equals: stringEquals12.get(), result: result12.get()},
        {enabled: enabled13.get(), equals: stringEquals13.get(), result: result13.get()},
        {enabled: enabled14.get(), equals: stringEquals14.get(), result: result14.get()},
        {enabled: enabled15.get(), equals: stringEquals15.get(), result: result15.get()}
    ];

    for (let check of checks) {
        if (check.enabled && inStr === check.equals) {
            res = check.result;
            break;
        }
    }

    resultNumber.set(res);
    triggerOut.trigger();
}

// Respond to changes
incomingString.onChange = checkString;
unknownResult.onChange = checkString;
enabled1.onChange = stringEquals1.onChange = result1.onChange = checkString;
enabled2.onChange = stringEquals2.onChange = result2.onChange = checkString;
enabled3.onChange = stringEquals3.onChange = result3.onChange = checkString;
enabled4.onChange = stringEquals4.onChange = result4.onChange = checkString;
enabled5.onChange = stringEquals5.onChange = result5.onChange = checkString;
enabled6.onChange = stringEquals6.onChange = result6.onChange = checkString;
enabled7.onChange = stringEquals7.onChange = result7.onChange = checkString;
enabled8.onChange = stringEquals8.onChange = result8.onChange = checkString;
enabled9.onChange = stringEquals9.onChange = result9.onChange = checkString;
enabled10.onChange = stringEquals10.onChange = result10.onChange = checkString;
enabled11.onChange = stringEquals11.onChange = result11.onChange = checkString;
enabled12.onChange = stringEquals12.onChange = result12.onChange = checkString;
enabled13.onChange = stringEquals13.onChange = result13.onChange = checkString;
enabled14.onChange = stringEquals14.onChange = result14.onChange = checkString;
enabled15.onChange = stringEquals15.onChange = result15.onChange = checkString;


};

Ops.User.rambodc.Check_String_Equals_Number.prototype = new CABLES.Op();
CABLES.OPS["b3f11717-de12-42a5-ade2-df3d5f354646"]={f:Ops.User.rambodc.Check_String_Equals_Number,objName:"Ops.User.rambodc.Check_String_Equals_Number"};




// **************************************************************
// 
// Ops.Sidebar.NumberInput_v2
// 
// **************************************************************

Ops.Sidebar.NumberInput_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inString("Text", "Number");
const inputValuePort = op.inValue("Input", 0);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
const defaultValuePort = op.inValue("Default", 0);
defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });

// outputs
const siblingsPort = op.outObject("Children");
const valuePort = op.outNumber("Result", defaultValuePort.get());

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    valuePort.set(parseFloat(defaultValuePort.get()));
    inputValuePort.set(parseFloat(defaultValuePort.get()));
});
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text-input");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelTextNode = document.createTextNode(labelPort.get());
label.appendChild(labelTextNode);
el.appendChild(label);
// var inputWrapper = document.createElement('div');
// inputWrapper.classList.add('sidebar__text-input-input-wrapper');
// el.appendChild(inputWrapper);
const input = document.createElement("input");
input.classList.add("sidebar__text-input-input");
input.setAttribute("type", "text");
input.setAttribute("value", defaultValuePort.get());
// inputWrapper.appendChild(input);
el.appendChild(input);
input.addEventListener("input", onInput);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
inputValuePort.onChange = onInputValuePortChanged;
setDefaultValueButtonPort.onTriggered = setDefaultValue;

// functions

function setDefaultValue()
{
    defaultValuePort.set(parseFloat(inputValuePort.get()));
    op.refreshParams();
}

function onInputValuePortChanged()
{
    let val = parseFloat(inputValuePort.get());
    if (isNaN(val)) { val = 0; }
    input.value = val;
    valuePort.set(val);
}

function onInput(ev)
{
    let newVal = parseFloat(ev.target.value);
    if (isNaN(newVal)) { newVal = 0; }
    valuePort.set(newVal);
    inputValuePort.set(newVal);
    op.refreshParams();
}

function onDefaultValueChanged()
{
    /*
    var defaultValue = defaultValuePort.get();
    valuePort.set(defaultValue);
    input.value = defaultValue;
    */
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI)
    {
        op.setTitle("Number Input: " + labelText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function showElement(element)
{
    if (element)
    {
        element.style.display = "block";
    }
}

function hideElement(element)
{
    if (element)
    {
        element.style.display = "none";
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(element)
{
    if (element && element.parentNode && element.parentNode.removeChild)
    {
        element.parentNode.removeChild(element);
    }
}


};

Ops.Sidebar.NumberInput_v2.prototype = new CABLES.Op();
CABLES.OPS["c4f3f1d7-de07-4c06-921e-32baeef4fc68"]={f:Ops.Sidebar.NumberInput_v2,objName:"Ops.Sidebar.NumberInput_v2"};




// **************************************************************
// 
// Ops.User.rambodc.Sidebar_input_number
// 
// **************************************************************

Ops.User.rambodc.Sidebar_input_number = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("Link");
const labelPort = op.inString("Text", "Number");
const inputValuePort = op.inValue("Input", 0);
const setDefaultValueButtonPort = op.inTriggerButton("Set Default");
const defaultValuePort = op.inValue("Default", 0);
const clearInputButtonPort = op.inTriggerButton("Clear");
defaultValuePort.setUiAttribs({ "hidePort": true, "greyout": true });

// outputs
const siblingsPort = op.outObject("Children");
const valuePort = op.outNumber("Result", defaultValuePort.get());

// vars
const el = document.createElement("div");
el.addEventListener("dblclick", function ()
{
    valuePort.set(parseFloat(defaultValuePort.get()));
    inputValuePort.set(parseFloat(defaultValuePort.get()));
});
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text-input");
el.classList.add("sidebar__reloadable");

const label = document.createElement("div");
label.classList.add("sidebar__item-label");
const labelTextNode = document.createTextNode(labelPort.get());
label.appendChild(labelTextNode);
el.appendChild(label);

const input = document.createElement("input");
input.classList.add("sidebar__text-input-input-number");
input.setAttribute("type", "text");
input.setAttribute("value", defaultValuePort.get());
el.appendChild(input);
input.addEventListener("input", onInput);

// events
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
defaultValuePort.onChange = onDefaultValueChanged;
op.onDelete = onDelete;
inputValuePort.onChange = onInputValuePortChanged;
setDefaultValueButtonPort.onTriggered = setDefaultValue;
clearInputButtonPort.onTriggered = clearInput;

// functions
function setDefaultValue()
{
    defaultValuePort.set(parseFloat(inputValuePort.get()));
    op.refreshParams();
}

function clearInput() {
    let defaultValue = 0;
    input.value = defaultValue;
    valuePort.set(defaultValue);
    inputValuePort.set(defaultValue);
    op.refreshParams();
}

function onInputValuePortChanged()
{
    let val = parseFloat(inputValuePort.get());
    if (isNaN(val)) { val = 0; }
    input.value = val;
    valuePort.set(val);
}

function onInput(ev)
{
    let newVal = parseFloat(ev.target.value);
    if (isNaN(newVal)) { newVal = 0; }
    valuePort.set(newVal);
    inputValuePort.set(newVal);
    op.refreshParams();
}

function onDefaultValueChanged()
{
}

function onLabelTextChanged()
{
    const labelText = labelPort.get();
    label.textContent = labelText;
    if (CABLES.UI)
    {
        op.setTitle("Number Input: " + labelText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(element)
{
    if (element && element.parentNode && element.parentNode.removeChild)
    {
        element.parentNode.removeChild(element);
    }
}


};

Ops.User.rambodc.Sidebar_input_number.prototype = new CABLES.Op();
CABLES.OPS["baa17184-bdd2-4e3a-8054-9f9d19b3eedf"]={f:Ops.User.rambodc.Sidebar_input_number,objName:"Ops.User.rambodc.Sidebar_input_number"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_AccountSet
// 
// **************************************************************

Ops.User.rambodc.XRPL_AccountSet = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs for AccountSet
const inClearFlag = op.inInt("ClearFlag");
const inDomain = op.inString("Domain");
const inEmailHash = op.inString("EmailHash");
const inMessageKey = op.inString("MessageKey");
const inNFTokenMinter = op.inString("NFTokenMinter");
const inSetFlag = op.inInt("SetFlag");
const inTransferRate = op.inInt("TransferRate");
const inTickSize = op.inInt("TickSize");
const inWalletLocator = op.inString("WalletLocator");
const inWalletSize = op.inInt("WalletSize");

// Additional object as input
const inAdditionalObject = op.inObject("Additional Object");

// Output
const outTransaction = op.outObject("Complete AccountSet Transaction");

// Trigger to add AccountSet fields
const inTriggerAddAccountSetFields = op.inTriggerButton("Add AccountSet Fields");

// Run the function when the trigger input is activated
inTriggerAddAccountSetFields.onTriggered = addAccountSetFields;

function addAccountSetFields() {
    let transaction = inAdditionalObject.get() || {}; // If no additional object is given, initialize an empty one
    transaction.TransactionType = "AccountSet"; // Set transaction type

    let clearFlag = inClearFlag.get();
    let domain = inDomain.get();
    let emailHash = inEmailHash.get();
    let messageKey = inMessageKey.get();
    let nfTokenMinter = inNFTokenMinter.get();
    let setFlag = inSetFlag.get();
    let transferRate = inTransferRate.get();
    let tickSize = inTickSize.get();
    let walletLocator = inWalletLocator.get();
    let walletSize = inWalletSize.get();

    if (clearFlag) transaction.ClearFlag = clearFlag;
    if (domain) transaction.Domain = domain;
    if (emailHash) transaction.EmailHash = emailHash;
    if (messageKey) transaction.MessageKey = messageKey;
    if (nfTokenMinter) transaction.NFTokenMinter = nfTokenMinter;
    if (setFlag) transaction.SetFlag = setFlag;
    if (transferRate) transaction.TransferRate = transferRate;
    if (tickSize) transaction.TickSize = tickSize;
    if (walletLocator) transaction.WalletLocator = walletLocator;
    if (walletSize) transaction.WalletSize = walletSize;

    outTransaction.set(transaction);
}


};

Ops.User.rambodc.XRPL_AccountSet.prototype = new CABLES.Op();
CABLES.OPS["5a1bd0b2-580a-4d05-b883-3b540f34d914"]={f:Ops.User.rambodc.XRPL_AccountSet,objName:"Ops.User.rambodc.XRPL_AccountSet"};




// **************************************************************
// 
// Ops.User.rambodc.Check_String_Equals
// 
// **************************************************************

Ops.User.rambodc.Check_String_Equals = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    incomingString = op.inString("Incoming String"),
    unknownResult = op.inString("Unknown Result", "0"),
    enabled1 = op.inBool("1 Enabled"),
    stringEquals1 = op.inString("1 String Equals"),
    result1 = op.inString("1 Result"),
    enabled2 = op.inBool("2 Enabled"),
    stringEquals2 = op.inString("2 String Equals"),
    result2 = op.inString("2 Result"),
    enabled3 = op.inBool("3 Enabled"),
    stringEquals3 = op.inString("3 String Equals"),
    result3 = op.inString("3 Result"),
    enabled4 = op.inBool("4 Enabled"),
    stringEquals4 = op.inString("4 String Equals"),
    result4 = op.inString("4 Result"),
    enabled5 = op.inBool("5 Enabled"),
    stringEquals5 = op.inString("5 String Equals"),
    result5 = op.inString("5 Result"),
    enabled6 = op.inBool("6 Enabled"),
    stringEquals6 = op.inString("6 String Equals"),
    result6 = op.inString("6 Result"),
    enabled7 = op.inBool("7 Enabled"),
    stringEquals7 = op.inString("7 String Equals"),
    result7 = op.inString("7 Result"),
    enabled8 = op.inBool("8 Enabled"),
    stringEquals8 = op.inString("8 String Equals"),
    result8 = op.inString("8 Result"),
    enabled9 = op.inBool("9 Enabled"),
    stringEquals9 = op.inString("9 String Equals"),
    result9 = op.inString("9 Result"),
    enabled10 = op.inBool("10 Enabled"),
    stringEquals10 = op.inString("10 String Equals"),
    result10 = op.inString("10 Result"),
    enabled11 = op.inBool("11 Enabled"),
    stringEquals11 = op.inString("11 String Equals"),
    result11 = op.inString("11 Result"),
    enabled12 = op.inBool("12 Enabled"),
    stringEquals12 = op.inString("12 String Equals"),
    result12 = op.inString("12 Result"),
    enabled13 = op.inBool("13 Enabled"),
    stringEquals13 = op.inString("13 String Equals"),
    result13 = op.inString("13 Result"),
    enabled14 = op.inBool("14 Enabled"),
    stringEquals14 = op.inString("14 String Equals"),
    result14 = op.inString("14 Result"),
    enabled15 = op.inBool("15 Enabled"),
    stringEquals15 = op.inString("15 String Equals"),
    result15 = op.inString("15 Result"),
    resultString = op.outString("Result String"),
    triggerOut = op.outTrigger("Trigger");

function checkString() {
    let inStr = incomingString.get();
    let res = unknownResult.get();
    let checks = [
        {enabled: enabled1.get(), equals: stringEquals1.get(), result: result1.get()},
        {enabled: enabled2.get(), equals: stringEquals2.get(), result: result2.get()},
        {enabled: enabled3.get(), equals: stringEquals3.get(), result: result3.get()},
        {enabled: enabled4.get(), equals: stringEquals4.get(), result: result4.get()},
        {enabled: enabled5.get(), equals: stringEquals5.get(), result: result5.get()},
        {enabled: enabled6.get(), equals: stringEquals6.get(), result: result6.get()},
        {enabled: enabled7.get(), equals: stringEquals7.get(), result: result7.get()},
        {enabled: enabled8.get(), equals: stringEquals8.get(), result: result8.get()},
        {enabled: enabled9.get(), equals: stringEquals9.get(), result: result9.get()},
        {enabled: enabled10.get(), equals: stringEquals10.get(), result: result10.get()},
        {enabled: enabled11.get(), equals: stringEquals11.get(), result: result11.get()},
        {enabled: enabled12.get(), equals: stringEquals12.get(), result: result12.get()},
        {enabled: enabled13.get(), equals: stringEquals13.get(), result: result13.get()},
        {enabled: enabled14.get(), equals: stringEquals14.get(), result: result14.get()},
        {enabled: enabled15.get(), equals: stringEquals15.get(), result: result15.get()}
    ];

    for (let check of checks) {
        if (check.enabled && inStr === check.equals) {
            res = check.result;
            break;
        }
    }

    resultString.set(res);
    triggerOut.trigger();
}

// Respond to changes
incomingString.onChange = checkString;
unknownResult.onChange = checkString;
enabled1.onChange = stringEquals1.onChange = result1.onChange = checkString;
enabled2.onChange = stringEquals2.onChange = result2.onChange = checkString;
enabled3.onChange = stringEquals3.onChange = result3.onChange = checkString;
enabled4.onChange = stringEquals4.onChange = result4.onChange = checkString;
enabled5.onChange = stringEquals5.onChange = result5.onChange = checkString;
enabled6.onChange = stringEquals6.onChange = result6.onChange = checkString;
enabled7.onChange = stringEquals7.onChange = result7.onChange = checkString;
enabled8.onChange = stringEquals8.onChange = result8.onChange = checkString;
enabled9.onChange = stringEquals9.onChange = result9.onChange = checkString;
enabled10.onChange = stringEquals10.onChange = result10.onChange = checkString;
enabled11.onChange = stringEquals11.onChange = result11.onChange = checkString;
enabled12.onChange = stringEquals12.onChange = result12.onChange = checkString;
enabled13.onChange = stringEquals13.onChange = result13.onChange = checkString;
enabled14.onChange = stringEquals14.onChange = result14.onChange = checkString;
enabled15.onChange = stringEquals15.onChange = result15.onChange = checkString;


};

Ops.User.rambodc.Check_String_Equals.prototype = new CABLES.Op();
CABLES.OPS["69996816-1f7b-4ca4-a577-0c418b76a3eb"]={f:Ops.User.rambodc.Check_String_Equals,objName:"Ops.User.rambodc.Check_String_Equals"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_SignTransaction1
// 
// **************************************************************

Ops.User.rambodc.XRPL_SignTransaction1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs
const inTrigger = op.inTriggerButton("Trigger In");
const inWss = op.inString("WSS URL");
const inSeed = op.inString("Sender Secret Key");
const inTransaction = op.inObject("Transaction");

// Outputs
const outTransactionHash = op.outString("Transaction Hash");
const outTransactionStatus = op.outString("Transaction Status");
const outTransactionDetails = op.outObject("Transaction Details");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");
const outError = op.outString("Error");
const outMissingFields = op.outBool("Missing Fields");

// Variables
let client = null;

// Event listeners
inTrigger.onTriggered = main;

// Functions
function clearOutputs() {
    outTransactionHash.set('');
    outTransactionStatus.set('');
    outTransactionDetails.set(null);
    outError.set('');
    outMissingFields.set(false);
}

async function main() {
    clearOutputs();

    if (!inWss.get() || !inSeed.get() || !inTransaction.get()) {
        let missingFields = "";
        if (!inWss.get()) {
            missingFields += "WSS URL, ";
        }
        if (!inSeed.get()) {
            missingFields += "Sender Secret Key, ";
        }
        if (!inTransaction.get()) {
            missingFields += "Transaction, ";
        }

        outError.set(missingFields + "should not be empty");
        outMissingFields.set(true);
        outFailure.trigger();
        return;
    }

    try {
        if (client === null) {
            client = new xrpl.Client(inWss.get());
            await client.connect();
        }

        const wallet = xrpl.Wallet.fromSeed(inSeed.get());

        const prepared = await client.autofill(inTransaction.get());
        const signed = wallet.sign(prepared);
        const result = await client.submitAndWait(signed.tx_blob);

        outTransactionHash.set(result.result.hash);

        const tx = await client.request({
            command: 'tx',
            transaction: result.result.hash
        });

        if (tx.result.meta.TransactionResult === 'tesSUCCESS') {
            outTransactionStatus.set(tx.result.meta.TransactionResult);
            outTransactionDetails.set(tx.result);
            outSuccess.trigger();
        } else {
            outTransactionStatus.set(tx.result.meta.TransactionResult);
            outFailure.trigger();
        }

    } catch (error) {
        let errorMessage = error.message;

        if (error.data) {
            errorMessage += ' Data: ' + JSON.stringify(error.data);
        }

        if (error.code) {
            errorMessage += ' Code: ' + error.code;
        }

        outError.set(errorMessage);
        outFailure.trigger();
    } finally {
        if (client !== null) {
            await client.disconnect();
            client = null;
        }
    }
}


};

Ops.User.rambodc.XRPL_SignTransaction1.prototype = new CABLES.Op();
CABLES.OPS["e4528fbf-7e7c-4963-92d1-2a8fe00c75dd"]={f:Ops.User.rambodc.XRPL_SignTransaction1,objName:"Ops.User.rambodc.XRPL_SignTransaction1"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_Common_Fields
// 
// **************************************************************

Ops.User.rambodc.XRPL_Common_Fields = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs for Common Fields
const inAccount = op.inString("Account");
const inFee = op.inValue("Fee");
const inSequence = op.inValue("Sequence");
const inAccountTxnID = op.inString("AccountTxnID");
const inFlags = op.inString("Flags");
const inLastLedgerSequence = op.inValue("LastLedgerSequence");
const inMemos = op.inArray("Memos");
const inSigners = op.inArray("Signers");
const inSourceTag = op.inValue("SourceTag");

// Additional object as input
const inAdditionalObject = op.inObject("Additional Object");

// Output
const outTransaction = op.outObject("Complete Transaction");

// Trigger to add common fields
const inTriggerAddCommonFields = op.inTriggerButton("Add Common Fields");

// Run the function when the trigger input is activated
inTriggerAddCommonFields.onTriggered = addCommonFields;

function addCommonFields() {
    let transaction = JSON.parse(JSON.stringify(inAdditionalObject.get() || {})); // Deep copy

    let account = inAccount.get();
    let fee = inFee.get();
    let sequence = inSequence.get();
    let accountTxnID = inAccountTxnID.get();
    let flag = inFlags.get();
    let lastLedgerSequence = inLastLedgerSequence.get();
    let memos = inMemos.get();
    let signers = inSigners.get();
    let sourceTag = inSourceTag.get();

    if (account) transaction.Account = account;
    if (fee) transaction.Fee = fee;
    if (sequence) transaction.Sequence = sequence;
    if (accountTxnID) transaction.AccountTxnID = accountTxnID;
    if (flag) transaction.Flags = parseInt(flag, 16);
    if (lastLedgerSequence) transaction.LastLedgerSequence = lastLedgerSequence;
    if (memos && memos.length > 0) transaction.Memos = memos;
    if (signers && signers.length > 0) transaction.Signers = signers;
    if (sourceTag) transaction.SourceTag = sourceTag;

    outTransaction.set(transaction);
}


};

Ops.User.rambodc.XRPL_Common_Fields.prototype = new CABLES.Op();
CABLES.OPS["37d0b7fb-5709-40b1-931e-44ff3e5fd8bd"]={f:Ops.User.rambodc.XRPL_Common_Fields,objName:"Ops.User.rambodc.XRPL_Common_Fields"};




// **************************************************************
// 
// Ops.Ui.VizArrayTable
// 
// **************************************************************

Ops.Ui.VizArrayTable = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inArr = op.inArray("Array"),
    inOffset = op.inInt("Start Row", 0);

op.setUiAttrib({ "height": 200, "width": 400, "resizable": true });

function getCellValue(v)
{
    let str = "";

    if (typeof v == "string")
    {
        if (CABLES.UTILS.isNumeric(v)) str = "\"" + v + "\"";
        else str = v;
    }
    else if (CABLES.UTILS.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
    else if (Array.isArray(v))
    {
        let preview = "...";
        if (v.length == 0) preview = "";
        str = "[" + preview + "] (" + v.length + ")";
    }
    else if (typeof v == "object")
    {
        try
        {
            str = JSON.stringify(v, true, 1);
        }
        catch (e)
        {
            str = "{???}";
        }
    }
    else if (v != v || v === undefined)
    {
        str += String(v);
    }
    else
    {
        str += String(v);
    }

    return str;
}

op.renderVizLayer = (ctx, layer) =>
{
    ctx.fillStyle = "#222";
    ctx.fillRect(layer.x, layer.y, layer.width, layer.height);

    ctx.save();
    ctx.scale(layer.scale, layer.scale);

    ctx.font = "normal 10px sourceCodePro";
    ctx.fillStyle = "#ccc";

    const arr = inArr.get() || [];
    let stride = 1;

    if (inArr.get() === null) op.setUiAttrib({ "extendTitle": "null" });
    else if (inArr.get() === undefined) op.setUiAttrib({ "extendTitle": "undefined" });
    else op.setUiAttrib({ "extendTitle": "length: " + arr.length });

    if (inArr.links.length > 0 && inArr.links[0].getOtherPort(inArr))
        stride = inArr.links[0].getOtherPort(inArr).uiAttribs.stride || 1;

    let lines = Math.floor(layer.height / layer.scale / 10 - 1);
    let padding = 4;
    let offset = inOffset.get() * stride;
    let columnsWidth = [];

    for (let i = 0; i < stride; i++)columnsWidth[i] = 0;

    for (let i = offset; i < offset + lines * stride; i += stride)
    {
        for (let s = 0; s < stride; s++)
        {
            const v = arr[i + s];

            columnsWidth[s] = Math.max(columnsWidth[s], getCellValue(v).length);
        }
    }

    let columsPos = [];
    let addUpPos = 30;
    for (let i = 0; i < stride; i++)
    {
        columsPos[i] = addUpPos;
        addUpPos += (columnsWidth[i] + 1) * 7;
    }

    for (let i = offset; i < offset + lines * stride; i += stride)
    {
        if (i < 0) continue;
        if (i + stride > arr.length) continue;

        ctx.fillStyle = "#666";

        const lineNum = (i) / stride;

        if (lineNum >= 0)
            ctx.fillText(lineNum,
                layer.x / layer.scale + padding,
                layer.y / layer.scale + 10 + (i - offset) / stride * 10 + padding);

        for (let s = 0; s < stride; s++)
        {
            const v = arr[i + s];
            let str = getCellValue(v);

            ctx.fillStyle = "#ccc";

            if (typeof v == "string")
            {
            }
            else if (CABLES.UTILS.isNumeric(v)) str = String(Math.round(v * 10000) / 10000);
            else if (Array.isArray(v))
            {
            }
            else if (typeof v == "object")
            {
            }
            else if (v != v || v === undefined)
            {
                ctx.fillStyle = "#f00";
            }

            ctx.fillText(str,
                layer.x / layer.scale + columsPos[s],
                layer.y / layer.scale + 10 + (i - offset) / stride * 10 + padding);
        }
    }

    if (inArr.get() === null) ctx.fillText("null", layer.x / layer.scale + 10, layer.y / layer.scale + 10 + padding);
    else if (inArr.get() === undefined) ctx.fillText("undefined", layer.x / layer.scale + 10, layer.y / layer.scale + 10 + padding);

    const gradHeight = 30;

    if (layer.scale <= 0) return;
    if (offset > 0)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + 5, 0, layer.y / layer.scale + gradHeight);
        radGrad.addColorStop(0, "#222");
        radGrad.addColorStop(1, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale, 200000, gradHeight);
    }

    if (offset + lines * stride < arr.length)
    {
        const radGrad = ctx.createLinearGradient(0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + 5, 0, layer.y / layer.scale + layer.height / layer.scale - gradHeight + gradHeight);
        radGrad.addColorStop(1, "#222");
        radGrad.addColorStop(0, "rgba(34,34,34,0.0)");
        ctx.fillStyle = radGrad;
        ctx.fillRect(layer.x / layer.scale, layer.y / layer.scale + layer.height / layer.scale - gradHeight, 200000, gradHeight);
    }

    ctx.restore();
};


};

Ops.Ui.VizArrayTable.prototype = new CABLES.Op();
CABLES.OPS["af2eeaaf-ff86-4bfb-9a27-42f05160a5d8"]={f:Ops.Ui.VizArrayTable,objName:"Ops.Ui.VizArrayTable"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_Get_MultiSigning1
// 
// **************************************************************

Ops.User.rambodc.XRPL_Get_MultiSigning1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const inTrigger = op.inTriggerButton("Trigger In");
const inWss = op.inString("WSS URL");
const inAddress = op.inString("XRPL Address");

const outSignerEntries = op.outArray("SignerEntries");
const outSuccess = op.outTrigger("Success");
const outFailure = op.outTrigger("Failure");
const outError = op.outString("Error");
const outMissingFields = op.outBool("Missing Fields");

inTrigger.onTriggered = main;
let client = null;

async function main() {

  // Check if required fields are missing
  if (!inWss.get() || !inAddress.get()) {
    outError.set("Missing fields");
    outMissingFields.set(true);
    outFailure.trigger();
    return;
  }

  try {
    if (client === null) {
      client = new xrpl.Client(inWss.get());
      await client.connect();
    }

    // Fetch account objects using GetAccountObjects API
    const accountObjects = await client.request({
      command: "account_objects",
      account: inAddress.get(),
      type: "signer_list",
      ledger_index: "validated"
    });

    // Get the signer list
    const signerListObjects = accountObjects.result.account_objects;

    // Get the array inside SignerEntries and set it as the output
    if (signerListObjects.length > 0 && signerListObjects[0].SignerEntries) {
      outSignerEntries.set(signerListObjects[0].SignerEntries);
    } else {
      outSignerEntries.set([]);
    }

    outSuccess.trigger();
  } catch (error) {
    outError.set(error.message);
    outFailure.trigger();
  } finally {
    if (client !== null) {
      client.disconnect();
      client = null;
    }
  }
}


};

Ops.User.rambodc.XRPL_Get_MultiSigning1.prototype = new CABLES.Op();
CABLES.OPS["af9273bc-8e37-4b03-b940-7e793f649f66"]={f:Ops.User.rambodc.XRPL_Get_MultiSigning1,objName:"Ops.User.rambodc.XRPL_Get_MultiSigning1"};




// **************************************************************
// 
// Ops.User.rambodc.List3
// 
// **************************************************************

Ops.User.rambodc.List3 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
/*-----------------

Example Exampandable Text Path. It displays the Value with Path with Custom Keys. The following is the format.

{
  "unexpandedTextPaths": [
"amount", "currency",  "transactionType", "name", "createdAt"

  ]
}

{
  "expandableTextPaths": [
    { "key": "nameTitle", "path": "name" },
    { "key": "amountTitle", "path": "amount"},
    { "key": "imageTitle", "path": "image" }
  ]
}

------------------*/




// Inputs
const parentPort = op.inObject("link");
const dataArrayPort = op.inArray("Data Array");
const sortPort = op.inBool("Sorting", true);
const expandablePort = op.inBool("Expandable");
const unexpandedIconPathPort = op.inString("Unexpanded Icon Path");
const unexpandedTextPathPort = op.inArray("Unexpanded Text Paths");
const expandedIconPathPort = op.inString("Expandable Icon Path");
const expandedTextPathPort = op.inArray("Expandable Text Path");
const expandableOptionsTextPort = op.inString("Expandable Options Text");
const expandableImagePort = op.inString("Expandable Image");

// Outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Button Pressed");
const buttonIndexPort = op.outValue("Button Index");
const selectedObjectPort = op.outObject("Selected Object");
const optionsTriggerPort = op.outTrigger("Options Trigger");

// Variables
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
let buttons = [];
let sortedData = [];
let expandedButton = null;

function getNestedProperty(obj, key)
{
    return key.split(".").reduce(function (o, x)
    {
        return (typeof o == "undefined" || o === null) ? o : o[x];
    }, obj);
}

function initializeButtons()
{
    buttons.forEach((button) => { return el.removeChild(button); });
    buttons = [];

    const dataArray = dataArrayPort.get();
    if (!dataArray) return;

    sortedData = sortPort.get() ? dataArray.slice().reverse() : dataArray.slice();

    sortedData.forEach((data, index) =>
    {
        const button = document.createElement("div");
        button.classList.add("sidebar__button-input-list2-unexpandable");
        button.dataset.expanded = "false";
        button.addEventListener("click", (event) => { return onButtonClick(index, button, event); });
        button.style.lineHeight = "1.6";  // Replace with your desired line-height
        button.style.fontSize = "14px";  // Replace with your desired font-size
        const unexpandedIconPath = unexpandedIconPathPort.get();
        if (unexpandedIconPath)
        {
            const unexpandedIconUrl = getNestedProperty(data, unexpandedIconPath);

            const img = document.createElement("img");
            img.src = unexpandedIconUrl;
            img.style.marginRight = "5px";
            img.width = 50;
            img.height = 50;
            button.appendChild(img);
        }

        const inputTextPaths = unexpandedTextPathPort.get();
        let inputText = "";
        inputTextPaths.forEach(path => {
            inputText += getNestedProperty(data, path) + " ";
        });

        const inputTextNode = document.createTextNode(inputText);
        button.appendChild(inputTextNode);

        el.appendChild(button);
        buttons.push(button);
    });
}

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

parentPort.onChange = onParentChanged;
dataArrayPort.onChange = initializeButtons;
sortPort.onChange = initializeButtons;
expandablePort.onChange = initializeButtons;
unexpandedIconPathPort.onChange = initializeButtons;
unexpandedTextPathPort.onChange = initializeButtons;
expandedIconPathPort.onChange = initializeButtons;
expandedTextPathPort.onChange = initializeButtons;
expandableOptionsTextPort.onChange = initializeButtons;
expandableImagePort.onChange = initializeButtons;

function onButtonClick(index, button, event)
{
    event.stopPropagation();
    buttonIndexPort.set(index);
    let buttonObject = sortedData[index];
    selectedObjectPort.set(buttonObject);

    if (expandablePort.get() && expandedButton && expandedButton !== button)
    {
        contractButton(expandedButton);
    }

    if (expandablePort.get() && button.dataset.expanded === "false")
    {
        expandButton(button, buttonObject);
        expandedButton = button;
    }
    else if (expandablePort.get() && button.dataset.expanded === "true")
    {
        contractButton(button);
        if (expandedButton === button)
        {
            expandedButton = null;
        }
    }

    buttonPressedPort.trigger();  // Trigger irrespective of "expandablePort" value
}



function expandButton(button, buttonObject)
{
    button.innerHTML = "";
    button.classList.remove("sidebar__button-input-list2-unexpandable");
    button.classList.add("sidebar__button-input-list2-expandable");

    const expandedIconPath = expandedIconPathPort.get();
    if (expandedIconPath)
    {
        const expandedIconUrl = getNestedProperty(buttonObject, expandedIconPath);

        const img = document.createElement("img");
        img.src = expandedIconUrl;
        img.style.marginBottom = "5px";
        img.width = 50;
        img.height = 50;
        button.appendChild(img);
    }

    expandedTextPathPort.get().forEach((pathObject) =>
    {
        const pathText = document.createTextNode(pathObject.key + ": " + getNestedProperty(buttonObject, pathObject.path));

        const pathTextDiv = document.createElement("div");
        pathTextDiv.appendChild(pathText);
        pathTextDiv.classList.add("sidebar__button-input-list2-expandable-text");

        button.appendChild(pathTextDiv);
    });

    const optionsButton = document.createElement("div");
    optionsButton.classList.add("optionsButton");
    optionsButton.textContent = expandableOptionsTextPort.get();
    optionsButton.addEventListener("click", (event) =>
    {
        event.stopPropagation();
        optionsTriggerPort.trigger();
    });
    button.appendChild(optionsButton);

    const expandableImagePath = expandableImagePort.get();
    if (expandableImagePath)
    {
        const expandableImageUrl = getNestedProperty(buttonObject, expandableImagePath);

        const img = document.createElement("img");
        img.src = expandableImageUrl;
        img.style.width = "320px";
        img.style.height = "auto";

        button.appendChild(img);
    }

    button.dataset.expanded = "true";
}

function contractButton(button)
{
    const buttonObject = sortedData[buttons.indexOf(button)];

    button.innerHTML = "";
    button.classList.remove("sidebar__button-input-list2-expandable");
    button.classList.add("sidebar__button-input-list2-unexpandable");

    const unexpandedIconPath = unexpandedIconPathPort.get();
    if (unexpandedIconPath)
    {
        const unexpandedIconUrl = getNestedProperty(buttonObject, unexpandedIconPath);

        const img = document.createElement("img");
        img.src = unexpandedIconUrl;
        img.style.marginRight = "5px";
        img.width = 50;
        img.height = 50;
        button.appendChild(img);
    }

    const inputTextPaths = unexpandedTextPathPort.get();
    let inputText = "";
    inputTextPaths.forEach(path => {
        inputText += getNestedProperty(buttonObject, path) + " ";
    });

    const inputTextNode = document.createTextNode(inputText);
    button.appendChild(inputTextNode);
    button.dataset.expanded = "false";
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    {
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

op.onDelete = function ()
{
    if (el.parentNode)
    {
        el.parentNode.removeChild(el);
    }
};


};

Ops.User.rambodc.List3.prototype = new CABLES.Op();
CABLES.OPS["0fc03344-509f-4026-8c4b-2f073eb47885"]={f:Ops.User.rambodc.List3,objName:"Ops.User.rambodc.List3"};




// **************************************************************
// 
// Ops.Json.ObjectGetArrayByPath
// 
// **************************************************************

Ops.Json.ObjectGetArrayByPath = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const objectIn = op.inObject("Object");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");
const foundOut = op.outBool("Found");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    const path = pathIn.get();
    op.setUiError("missing", null);
    if (data && path)
    {
        if (!Array.isArray(data) && !(typeof data === "object"))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input object of type " + (typeof data) + " is not travesable by path");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            op.setUiAttrib({ "extendTitle": parts[parts.length - 1] + "" });
            let result = resolve(path, data);
            if (result === undefined)
            {
                const errorMsg = "could not find element at path " + path;
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 2);
            }
            else if (!Array.isArray(result))
            {
                const errorMsg = "element at path " + path + " is not an array";
                foundOut.set(false);
                result = null;
                op.setUiError("missing", errorMsg, 2);
            }
            else
            {
                foundOut.set(true);
            }
            resultOut.setRef(result);
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => { return prev && prev[curr]; }, obj);
}


};

Ops.Json.ObjectGetArrayByPath.prototype = new CABLES.Op();
CABLES.OPS["a9354531-a42d-4216-ad8c-364df989a9a1"]={f:Ops.Json.ObjectGetArrayByPath,objName:"Ops.Json.ObjectGetArrayByPath"};




// **************************************************************
// 
// Ops.User.rambodc.SignerList_Get_Users
// 
// **************************************************************

Ops.User.rambodc.SignerList_Get_Users = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
/**

Fully customized code to get multisigning array from XRPL.
Using the Account field to look into users collection.

[
  {
    "SignerEntry": {
      "Account": "rJpym3TKQ9YxTTBdoVmA8Rr56ST1Gh1wjz",
      "SignerWeight": 1
    }
  },
  {
    "SignerEntry": {
      "Account": "rQDdK9eotkdQuYfZvuNy5tCsqQ35KYZAox",
      "SignerWeight": 1
    }
  }
]

Looking into users collection , then if the account matches classic address
Then it will grab 4 info including names and email and icon to create a
new output array.  Like this:

[
  {
    "SignerEntry": {
      "Account": "rJpym3TKQ9YxTTBdoVmA8Rr56ST1Gh1wjz",
      "SignerWeight": 1,
      "firstName": "Admin",
      "email": "admin@centipedes.ca",
      "lastName": "Centipede",
      "icon": "https://firebasestorage.googleapis.com/v0/b/cables-5b10a.appspot.com/o/assets%2FuserProfile.png?alt=media&token=1dff1a89-7d8c-4102-828f-e2e481c95061"
    }
  },
  {
    "SignerEntry": {
      "Account": "rQDdK9eotkdQuYfZvuNy5tCsqQ35KYZAox",
      "SignerWeight": 1,
      "firstName": "unknown",
      "email": "unknown",
      "lastName": "unknown",
      "icon": "unknown"
    }
  }
]

**/

const inTrigger = op.inTriggerButton("Initialize");
const inArray = op.inArray("Input Array");

const outArray = op.outArray("Array Result");
const outSuccess = op.outTrigger("Success Trigger");
const outFail = op.outTrigger("Fail Trigger");
const outError = op.outString("Error");

inTrigger.onTriggered = async () => {
  const inputArray = inArray.get();

  const db = firebase.firestore();
  const usersRef = db.collection("users");

  const promises = inputArray.map(async (item) => {
    const account = item.SignerEntry.Account;

    try {
      const snapshot = await usersRef.where("classicAddress", "==", account).limit(1).get();

      if (snapshot.empty) {
        return {
          SignerEntry: {
            ...item.SignerEntry,
            firstName: "unknown",
            email: "unknown",
            lastName: "unknown",
            icon: "unknown",
          },
        };
      }

      const doc = snapshot.docs[0];
      const userData = doc.data();

      return {
        SignerEntry: {
          ...item.SignerEntry,
          firstName: userData.firstName,
          email: userData.email,
          lastName: userData.lastName,
          icon: userData.icon,
        },
      };
    } catch (error) {
      outError.set(error.message);
      outFail.trigger();
    }
  });

  try {
    const results = await Promise.all(promises);
    outArray.set(results);
    outSuccess.trigger();
  } catch (error) {
    outError.set(error.message);
    outFail.trigger();
  }
};



};

Ops.User.rambodc.SignerList_Get_Users.prototype = new CABLES.Op();
CABLES.OPS["ed6e229e-e4cd-4f55-9588-2f8805706bbd"]={f:Ops.User.rambodc.SignerList_Get_Users,objName:"Ops.User.rambodc.SignerList_Get_Users"};




// **************************************************************
// 
// Ops.User.rambodc.XRPL_Setup_MultiSigning1
// 
// **************************************************************

Ops.User.rambodc.XRPL_Setup_MultiSigning1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const inInitialArray = op.inArray("Initial Array", []);
const inInitializeTrigger = op.inTriggerButton("Initialize Trigger");
const inMainAccount = op.inString("Main Account");

const inAddAccount = op.inString("Add Account");
const inSignerWeight = op.inValueInt("SignerWeight");
const inAddSignerEntry = op.inTriggerButton("Add SignerEntry");
const inRemoveSignerEntryAccount = op.inString("Remove SignerEntry Account");
const inRemoveSignerEntry = op.inTriggerButton("Remove SignerEntry");

const outSignerEntryArray = op.outArray("SignerEntry Array");
const outSignerListSetJson = op.outObject("SignerListSet JSON");
const outErrorMessage = op.outString("Error message");
const outQuorum = op.outNumber("Quorum");

const outSuccessInitialize = op.outTrigger("Success Initialize");
const outFailInitialize = op.outTrigger("Fail Initialize");
const outSuccessAdd = op.outTrigger("Success Add");
const outFailAdd = op.outTrigger("Fail Add");
const outSuccessRemove = op.outTrigger("Success Remove");
const outFailRemove = op.outTrigger("Fail Remove");

let currentArray = [];

inInitializeTrigger.onTriggered = () => {
    let initialArray = inInitialArray.get();
    if (initialArray) {
        currentArray = [...initialArray];
        updateOutputAndQuorum();
        outSuccessInitialize.trigger();
    } else {
        outErrorMessage.set("Failed to initialize array");
        outFailInitialize.trigger();
    }
};

inAddSignerEntry.onTriggered = () => {
    const account = inAddAccount.get();
    const weight = inSignerWeight.get();

    if (!account || weight == null) {
        outErrorMessage.set("Account and SignerWeight should not be empty");
        outFailAdd.trigger();
        return;
    }

    if (weight <= 0 || weight % 1 !== 0) {
        outErrorMessage.set("SignerWeight should be a positive integer");
        outFailAdd.trigger();
        return;
    }

    if (currentArray.some((entry) => { return entry.SignerEntry.Account === account; })) {
        outErrorMessage.set("Account already exists in the list");
        outFailAdd.trigger();
        return;
    }

    const newEntry = {
        "SignerEntry": {
            "Account": account,
            "SignerWeight": weight
        }
    };

    currentArray.push(newEntry);
    updateOutputAndQuorum();
    outSuccessAdd.trigger();
};

inRemoveSignerEntry.onTriggered = () => {
    const accountToRemove = inRemoveSignerEntryAccount.get();
    const indexToRemove = currentArray.findIndex((entry) => entry.SignerEntry.Account === accountToRemove);

    if (indexToRemove === -1) {
        outErrorMessage.set("Account not found for removal");
        outFailRemove.trigger();
        return;
    }

    currentArray.splice(indexToRemove, 1);
    updateOutputAndQuorum();
    outSuccessRemove.trigger();
};

function updateOutputAndQuorum() {
    outSignerEntryArray.set(currentArray);
    const totalWeight = currentArray.reduce((total, entry) => { return total + entry.SignerEntry.SignerWeight; }, 0);
    outQuorum.set(totalWeight);

    let mainAccount = inMainAccount.get();
    if (mainAccount) {
        const signerListSetJson = {
            "TransactionType": "SignerListSet",
            "Account": mainAccount,
            "SignerQuorum": totalWeight
        };

        if (currentArray.length > 0) {
            signerListSetJson["SignerEntries"] = currentArray;
        }

        outSignerListSetJson.set(signerListSetJson);
    } else {
        outErrorMessage.set("Main Account should not be empty");
        outFailInitialize.trigger();
    }
}


};

Ops.User.rambodc.XRPL_Setup_MultiSigning1.prototype = new CABLES.Op();
CABLES.OPS["bd18f74f-4109-4573-beeb-cabbec385875"]={f:Ops.User.rambodc.XRPL_Setup_MultiSigning1,objName:"Ops.User.rambodc.XRPL_Setup_MultiSigning1"};




// **************************************************************
// 
// Ops.User.rambodc.button_customize
// 
// **************************************************************

Ops.User.rambodc.button_customize = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const buttonTextPort = op.inString("Text", "Button");

// additional inputs for CSS customizations
const backgroundColorPort = op.inString("Background Color", "rgba(255,255,255,0.2)");
const textPositionPort = op.inString("Text Position", "center");
const buttonHeightPort = op.inString("Button Height", "40px");
const textColorPort = op.inString("Text Color", "rgba(255,255,255,1)");
const hoverColorPort = op.inString("Hover Color", "rgba(255,255,255,0.5)");
const paddingPort = op.inString("Padding", "10px 20px");
const marginPort = op.inString("Margin", "0px");
const borderRadiusPort = op.inString("Border Radius", "5px");
const fontWeightPort = op.inString("Font Weight", "normal");
const fontSizePort = op.inString("Font Size", "16px"); // new port for font size

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inGreyOut = op.inBool("Grey Out", false);
const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar--button");
const input = document.createElement("div");
input.classList.add("sidebar__button-input-custom");  // changed class name
el.appendChild(input);
input.addEventListener("click", onButtonClick);
input.addEventListener("mouseover", onMouseOver);
input.addEventListener("mouseout", onMouseOut);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);
op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = onButtonTextChanged;

// new onChange events for our new ports
backgroundColorPort.onChange = textColorPort.onChange = textPositionPort.onChange = buttonHeightPort.onChange = hoverColorPort.onChange = paddingPort.onChange = marginPort.onChange = borderRadiusPort.onChange = fontWeightPort.onChange = fontSizePort.onChange = applyStyles;

op.onDelete = onDelete;

const greyOut = document.createElement("div");
greyOut.classList.add("sidebar__greyout");
el.appendChild(greyOut);
greyOut.style.display = "none";

inGreyOut.onChange = function ()
{
    greyOut.style.display = inGreyOut.get() ? "block" : "none";
};

inVisible.onChange = function ()
{
    el.style.display = inVisible.get() ? "block" : "none";
};

function onButtonClick()
{
    buttonPressedPort.trigger();
}

function onButtonTextChanged()
{
    const buttonText = buttonTextPort.get();
    input.textContent = buttonText;
    if (CABLES.UI)
    {
        op.setTitle("Button: " + buttonText);
    }
}

function onParentChanged()
{
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement)
    {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    }
    else
    { // detach
        if (el.parentElement)
        {
            el.parentElement.removeChild(el);
        }
    }
}

function onMouseOver()
{
    input.style.backgroundColor = hoverColorPort.get();
    input.style.transform = 'scale(1.01)';  // simple animation on hover
}

function onMouseOut()
{
    input.style.backgroundColor = backgroundColorPort.get();
    input.style.transform = 'scale(1)';  // return to the original state
}

function applyStyles()
{
    input.style.backgroundColor = backgroundColorPort.get();
    input.style.color = textColorPort.get();
    input.style.textAlign = textPositionPort.get();
    input.style.height = buttonHeightPort.get();
    input.style.lineHeight = buttonHeightPort.get();
    input.style.padding = paddingPort.get();
    input.style.margin = marginPort.get();
    input.style.borderRadius = borderRadiusPort.get();
    input.style.fontWeight = fontWeightPort.get();
    input.style.fontSize = fontSizePort.get();  // applying font size
    input.style.cursor = "pointer";
    input.style.transition = "all 0.3s";  // transition for smooth animation
}

function onDelete()
{
    removeElementFromDOM(el);
}

function removeElementFromDOM(el)
{
    if (el && el.parentNode && el.parentNode.removeChild)
    {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.button_customize.prototype = new CABLES.Op();
CABLES.OPS["14b20a59-6228-4154-aa1f-61505ff62a49"]={f:Ops.User.rambodc.button_customize,objName:"Ops.User.rambodc.button_customize"};




// **************************************************************
// 
// Ops.Json.ArrayGetArrayValuesByPath
// 
// **************************************************************

Ops.Json.ArrayGetArrayValuesByPath = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const objectIn = op.inArray("Array");
const pathIn = op.inString("Path");
const resultOut = op.outArray("Output");
const foundOut = op.outBool("Found");

objectIn.onChange = update;
pathIn.onChange = update;

function update()
{
    const data = objectIn.get();
    let result = [];
    const path = pathIn.get();
    op.setUiError("path", null);

    if (data && path)
    {
        if (!Array.isArray(data))
        {
            foundOut.set(false);
            op.setUiError("notiterable", "input of type " + (typeof data) + " is not an array");
        }
        else
        {
            op.setUiError("notiterable", null);
            const parts = path.split(".");
            foundOut.set(false);

            const pathSuffix = parts.slice(1).join(".");

            for (let i = 0; i < data.length; i++)
            {
                const resolvePath = i + "." + pathSuffix;
                const resolvedData = resolve(resolvePath, data);
                if (typeof resolvedData !== "undefined")
                {
                    foundOut.set(true);
                }
                result.push(resolvedData);
            }
            const titleParts = pathIn.get().split(".");
            op.setUiAttrib({ "extendTitle": titleParts[titleParts.length - 1] + "" });
            if (foundOut.get())
            {
                resultOut.set(result);
            }
            else
            {
                op.setUiError("path", "given path seems to be invalid!", 1);
                resultOut.set([]);
            }
        }
    }
    else
    {
        foundOut.set(false);
    }
}

function resolve(path, obj = self, separator = ".")
{
    const properties = Array.isArray(path) ? path : path.split(separator);
    return properties.reduce((prev, curr) => prev && prev[curr], obj);
}


};

Ops.Json.ArrayGetArrayValuesByPath.prototype = new CABLES.Op();
CABLES.OPS["f4aa5756-c681-47ac-a997-b4f91760db96"]={f:Ops.Json.ArrayGetArrayValuesByPath,objName:"Ops.Json.ArrayGetArrayValuesByPath"};




// **************************************************************
// 
// Ops.User.rambodc.Sidebar_background_image
// 
// **************************************************************

Ops.User.rambodc.Sidebar_background_image = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// Inputs
const parentPort = op.inObject("link");
const labelPort = op.inString("Text");
const inId = op.inValueString("Id", "");
const clearTrigger = op.inTriggerButton("Clear");
const inVisible = op.inBool("Visible", true);
const isButton = op.inBool("Button", false);
// Inputs for CSS customization
const imageUrl = op.inString("Image URL", "");
const imageSize = op.inDropDown("Image Size", ["auto", "cover", "contain"], "auto");
const imagePosition = op.inString("Image Position", "0% 0%");
const imageRepeat = op.inDropDown("Image Repeat", ["no-repeat", "repeat", "repeat-x", "repeat-y"], "no-repeat");
const imageAttachment = op.inDropDown("Image Attachment", ["fixed", "local", "scroll"], "scroll");
const hoverColor = op.inString("Hover Color", "#f0f0f0");
const margin = op.inString("Margin", "0");
const padding = op.inString("Padding", "0");
const height = op.inString("Height", "auto");
const width = op.inString("Width", "auto");

// Outputs
const siblingsPort = op.outObject("childs");
const clickTrigger = op.outTrigger("Clicked");

// Variables
const el = document.createElement("div");
el.dataset.op = op.id;
el.classList.add("cablesEle");
el.classList.add("sidebar__item");
el.classList.add("sidebar__text");
const label = document.createElement("div");
label.classList.add("sidebar__item-label-v2");
const labelText = document.createElement("div");
label.appendChild(labelText);
el.appendChild(label);

// Event listeners
parentPort.onChange = onParentChanged;
labelPort.onChange = onLabelTextChanged;
inId.onChange = onIdChanged;
clearTrigger.onTriggered = onClearTriggered;
op.onDelete = onDelete;
inVisible.onChange = onVisibilityChanged;
isButton.onChange = onButtonChanged;

// New event listeners for CSS customization
imageUrl.onChange = applyStyles;
imageSize.onChange = applyStyles;
imagePosition.onChange = applyStyles;
imageRepeat.onChange = applyStyles;
imageAttachment.onChange = applyStyles;
hoverColor.onChange = applyStyles;
margin.onChange = applyStyles;
padding.onChange = applyStyles;
height.onChange = applyStyles;
width.onChange = applyStyles;

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// Functions
function applyStyles() {
    el.style.backgroundImage = `url(${imageUrl.get()})`;
    el.style.backgroundSize = imageSize.get();
    el.style.backgroundPosition = imagePosition.get();
    el.style.backgroundRepeat = imageRepeat.get();
    el.style.backgroundAttachment = imageAttachment.get();
    el.style.margin = margin.get();
    el.style.padding = padding.get();
    el.style.height = height.get();
    el.style.width = width.get();
    if (isButton.get()) {
        el.style.cursor = 'pointer';
        el.style.transition = 'background-color 0.3s';
    } else {
        el.style.cursor = 'default';
    }
}

function onVisibilityChanged() {
    el.style.display = inVisible.get() ? "block" : "none";
}

function onClearTriggered() {
    labelPort.set('');
    onLabelTextChanged();
}

function onIdChanged() {
    el.id = inId.get();
}

function onLabelTextChanged() {
    const labelText = labelPort.get();
    label.innerHTML = labelText;
    if (CABLES.UI) {
        if (labelText && typeof labelText === "string") {
            op.setTitle("Text: " + labelText.substring(0, 10));
        } else {
            op.setTitle("Text");
        }
    }
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else {
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function onButtonChanged() {
    if (isButton.get()) {
        el.addEventListener('click', onClicked);
        el.addEventListener('mouseover', onMouseOver);
        el.addEventListener('mouseout', onMouseOut);
    } else {
        el.removeEventListener('click', onClicked);
        el.removeEventListener('mouseover', onMouseOver);
        el.removeEventListener('mouseout', onMouseOut);
    }
    applyStyles();
}

function onClicked() {
    clickTrigger.trigger();
}

function onMouseOver() {
    el.style.backgroundColor = hoverColor.get();
}

function onMouseOut() {
    el.style.backgroundColor = "";
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Sidebar_background_image.prototype = new CABLES.Op();
CABLES.OPS["2afc8c6a-36ba-450f-8daf-67062d7a5b84"]={f:Ops.User.rambodc.Sidebar_background_image,objName:"Ops.User.rambodc.Sidebar_background_image"};




// **************************************************************
// 
// Ops.Json.ObjectGetNumber_v2
// 
// **************************************************************

Ops.Json.ObjectGetNumber_v2 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    data = op.inObject("Data"),
    key = op.inString("Key"),
    result = op.outNumber("Result"),
    outFound = op.outBoolNum("Found");

result.ignoreValueSerialize = true;
data.ignoreValueSerialize = true;

data.onChange = exec;

key.onChange = function ()
{
    if (!key.isLinked())op.setUiAttrib({ "extendTitle": key.get() });
    exec();
};

function exec()
{
    if (data.get())
    {
        const val = data.get()[key.get()];
        result.set(val);
        if (val === undefined) outFound.set(0);
        else outFound.set(1);
    }
    else
    {
        result.set(null);
        outFound.set(0);
    }
}


};

Ops.Json.ObjectGetNumber_v2.prototype = new CABLES.Op();
CABLES.OPS["a7335e79-046e-40da-9e9c-db779b0a5e53"]={f:Ops.Json.ObjectGetNumber_v2,objName:"Ops.Json.ObjectGetNumber_v2"};




// **************************************************************
// 
// Ops.Boolean.BoolToString
// 
// **************************************************************

Ops.Boolean.BoolToString = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
const
    inBool = op.inBool("Boolean", false),
    inTrue = op.inString("True", "true"),
    inFalse = op.inString("False", "false"),
    result = op.outString("String", "false");

inTrue.onChange =
    inFalse.onChange =
    inBool.onChange = update;

function update()
{
    if (inBool.get()) result.set(inTrue.get());
    else result.set(inFalse.get());
}


};

Ops.Boolean.BoolToString.prototype = new CABLES.Op();
CABLES.OPS["22a734aa-8b08-4db7-929b-393d4704e1d6"]={f:Ops.Boolean.BoolToString,objName:"Ops.Boolean.BoolToString"};




// **************************************************************
// 
// Ops.User.rambodc.Button_icon_desc
// 
// **************************************************************

Ops.User.rambodc.Button_icon_desc = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// inputs
const parentPort = op.inObject("link");
const iconPort = op.inString("Icon", "https://firebasestorage.googleapis.com/v0/b/cables-5b10a.appspot.com/o/assets%2FAccountsNodes.png?alt=media&token=36471c6c-5487-491f-ac31-76eddf2abd5d");
const buttonTextPort = op.inString("Text", "Button");
const buttonText2Port = op.inString("Text 2", "Second Line");
const rightTextPort = op.inString("Text Right", "Button");
const rightText2Port = op.inString("Text Right 2", "Second Line Right");
const rightIconPort = op.inString("Icon Right","https://firebasestorage.googleapis.com/v0/b/cables-5b10a.appspot.com/o/assets%2Fright-arrow%20(1).png?alt=media&token=d86bbe34-2ced-42f6-b4e4-7f5d752ff5f1");

// outputs
const siblingsPort = op.outObject("childs");
const buttonPressedPort = op.outTrigger("Pressed Trigger");

const inVisible = op.inBool("Visible", true);

// vars
const el = document.createElement("div");
el.dataset.op = op.id;
el.style.height = "60px";
el.style.display = "flex";
el.style.justifyContent = "space-between";
el.style.alignItems = "center";
el.style.backgroundColor = "transparent";
el.style.cursor = "pointer";
el.style.padding = "10px 10px";
el.style.transition = "background-color 0.3s, border-color 0.3s";
el.style.fontSize = "16px";
el.style.color = "white";
el.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
el.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";

const leftContainer = document.createElement("div");
leftContainer.style.display = "flex";
leftContainer.style.alignItems = "center";
el.appendChild(leftContainer);

const leftIcon = document.createElement("img");
leftIcon.src = iconPort.get();
leftIcon.style.width = "50px";
leftIcon.style.height = "50px";
leftIcon.style.padding = "10px";
leftContainer.appendChild(leftIcon);

const textContainer = document.createElement("div");
textContainer.style.display = "flex";
textContainer.style.flexDirection = "column";
textContainer.style.justifyContent = "center";
leftContainer.appendChild(textContainer);

const input = document.createElement("div");
input.style.textAlign = "left";
input.style.fontSize = "16px";
input.style.fontWeight = "bold";
input.style.marginBottom = "5px";
textContainer.appendChild(input);
const inputText = document.createTextNode(buttonTextPort.get());
input.appendChild(inputText);

const input2 = document.createElement("div");
input2.style.textAlign = "left";
input2.style.fontSize = "14px";
textContainer.appendChild(input2);
const inputText2 = document.createTextNode(buttonText2Port.get());
input2.appendChild(inputText2);

const rightContainer = document.createElement("div");
rightContainer.style.display = "flex";
rightContainer.style.alignItems = "center";
el.appendChild(rightContainer);

const rightTextContainer = document.createElement("div");
rightTextContainer.style.display = "flex";
rightTextContainer.style.flexDirection = "column";
rightTextContainer.style.justifyContent = "center";
rightContainer.appendChild(rightTextContainer);

const rightText = document.createElement("div");
rightText.innerText = rightTextPort.get();
rightText.style.fontWeight = "bold";
rightText.style.fontSize = "16px";
rightText.style.lineHeight = "1";
rightText.style.marginBottom = "5px";
rightTextContainer.appendChild(rightText);

const rightText2 = document.createElement("div");
rightText2.innerText = rightText2Port.get();
rightText2.style.fontSize = "14px";
rightTextContainer.appendChild(rightText2);

const rightIcon = document.createElement("img");
rightIcon.src = rightIconPort.get();
rightIcon.style.width = "20px";
rightIcon.style.height = "20px";
rightIcon.style.padding = "0 10px";
rightContainer.appendChild(rightIcon);

op.toWorkNeedsParent("Ops.Sidebar.Sidebar");

// Attach click event to the entire button
el.addEventListener("click", onButtonClick);
el.addEventListener("mouseenter", onButtonMouseEnter);
el.addEventListener("mouseleave", onButtonMouseLeave);

// events
parentPort.onChange = onParentChanged;
buttonTextPort.onChange = buttonText2Port.onChange = onButtonTextChanged;
rightTextPort.onChange = rightText2Port.onChange = onRightTextChanged;
iconPort.onChange = updateIcon;
rightIconPort.onChange = updateRightIcon;
op.onDelete = onDelete;
inVisible.onChange = updateVisibility;

function onButtonClick() {
    buttonPressedPort.trigger();
    el.style.borderColor = "rgba(255, 255, 255, 0.3)";
}

function onButtonMouseEnter() {
    el.style.backgroundColor = "rgba(255, 255, 255, 0.15)";
    el.style.color = "rgba(255, 255, 255, 0.9)";
    el.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    el.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
}

function onButtonMouseLeave() {
    el.style.backgroundColor = "transparent";
    el.style.color = "rgba(255, 255, 255, 0.9)";
    el.style.borderTop = "1px solid rgba(255, 255, 255, 0.1)";
    el.style.borderBottom = "1px solid rgba(255, 255, 255, 0.1)";
}

function onButtonTextChanged() {
    input.textContent = buttonTextPort.get();
    input2.textContent = buttonText2Port.get();
    if (CABLES.UI) {
        op.setTitle("Button: " + buttonTextPort.get() + "\n" + buttonText2Port.get());
    }
}

function onRightTextChanged() {
    rightText.innerText = rightTextPort.get();
    rightText2.innerText = rightText2Port.get();
}

function onParentChanged() {
    siblingsPort.set(null);
    const parent = parentPort.get();
    if (parent && parent.parentElement) {
        parent.parentElement.appendChild(el);
        siblingsPort.set(parent);
    } else { // detach
        if (el.parentElement) {
            el.parentElement.removeChild(el);
        }
    }
}

function updateIcon() {
    leftIcon.src = iconPort.get();
}

function updateRightIcon() {
    rightIcon.src = rightIconPort.get();
}

function updateVisibility() {
    el.style.display = inVisible.get() ? "flex" : "none";
}

function onDelete() {
    removeElementFromDOM(el);
}

function removeElementFromDOM(el) {
    if (el && el.parentNode && el.parentNode.removeChild) {
        el.parentNode.removeChild(el);
    }
}


};

Ops.User.rambodc.Button_icon_desc.prototype = new CABLES.Op();
CABLES.OPS["9da902e8-0e1c-4851-9321-3b0e1a50b32e"]={f:Ops.User.rambodc.Button_icon_desc,objName:"Ops.User.rambodc.Button_icon_desc"};




// **************************************************************
// 
// Ops.User.rambodc.FBQueryAllDocuments1
// 
// **************************************************************

Ops.User.rambodc.FBQueryAllDocuments1 = function()
{
CABLES.Op.apply(this,arguments);
const op=this;
const attachments={};
// input
const inTrigger = op.inTriggerButton("Trigger");
const inCollectionName = op.inString("Collection name");
const inUseQuery = op.inBool("Use Query");
const inQueryField = op.inString("Query Field");
const inQueryOperator = op.inDropDown("Query Operator", ["<", "<=", "==", ">", ">="]);
const inQueryValueAs = op.inDropDown("Query Value As", ["String", "Number", "Boolean", "Array", "Object"]);
const inQueryValueString = op.inString("Query Value String");
const inQueryValueNumber = op.inValue("Query Value Number");
const inQueryValueBool = op.inBool("Query Value Boolean");
const inQueryValueArray = op.inArray("Query Value Array");
const inQueryValueObject = op.inObject("Query Value Object");
const inFilterOnOrOff = op.inBool("Filter On or Off");
const inFilterKey = op.inString("Filter Key");
const inValueMustBe = op.inString("Value Must Be");

// output
const outSuccess = op.outTrigger("Success");
const outError = op.outTrigger("Error");
const outErrorMessage = op.outString("Error Message");
const outDocumentNotFound = op.outBool("Document Not Found");
const outDocuments = op.outArray("Documents");

// events
inTrigger.onTriggered = getDocuments;

function getDocuments() {
  const db = firebase.firestore();
  let docRef = db.collection(inCollectionName.get());

  if (inUseQuery.get()) {
    if (!inQueryField.get() || !inQueryOperator.get() || !inQueryValueAs.get()) {
      outErrorMessage.set(
        "Missing Arguments: Collection name, Query Field, Query Operator or Query Value is missing!"
      );
      outError.trigger();
      outDocuments.set(null);
      outDocumentNotFound.set(false);
      return;
    }
    let value = getValue();
    docRef = docRef.where(inQueryField.get(), inQueryOperator.get(), value);
  }

  if (inFilterOnOrOff.get()) {
    docRef = docRef.where(inFilterKey.get(), "==", inValueMustBe.get());
  }

  docRef.get().then((querySnapshot) => {
    if (!querySnapshot.empty) {
      let documents = [];
      querySnapshot.forEach((doc) => {
        let docData = doc.data();
        docData.id = doc.id; // Add this line
        documents.push(docData);
      });
      outDocuments.set(documents);
      outDocumentNotFound.set(false);
      outSuccess.trigger();
    } else {
      outDocuments.set(null);
      outDocumentNotFound.set(true);
      outError.trigger();
    }
  }).catch((error) => {
    outErrorMessage.set(error.message);
    outError.trigger();
  });
}

function getValue() {
  let valueAs = inQueryValueAs.get();
  if (valueAs === "String") {
    return inQueryValueString.get();
  }
  if (valueAs === "Number") {
    return Number(inQueryValueNumber.get()); // Convert to number
  }
  if (valueAs === "Boolean") {
    return inQueryValueBool.get();
  }
  if (valueAs === "Array") {
    return inQueryValueArray.get();
  }
  if (valueAs === "Object") {
    return inQueryValueObject.get();
  }
}


};

Ops.User.rambodc.FBQueryAllDocuments1.prototype = new CABLES.Op();
CABLES.OPS["91e23fdd-6b9b-4ec5-adf1-49560eb2d388"]={f:Ops.User.rambodc.FBQueryAllDocuments1,objName:"Ops.User.rambodc.FBQueryAllDocuments1"};



window.addEventListener('load', function(event) {
CABLES.jsLoaded=new Event('CABLES.jsLoaded');
document.dispatchEvent(CABLES.jsLoaded);
});
