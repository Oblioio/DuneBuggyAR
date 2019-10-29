import { ARScene } from "./arscene.js";

'use strict';

var arScene;
var aboveFoldWrapper = document.getElementById('aboveTheFold');
var belowFoldWrapper = document.getElementById('belowTheFold');
var showInfo = false;
var startTime = new Date().getTime();

function Main () {    

    arScene = new ARScene(sceneLoaded);
}

function sceneLoaded(){
    createOrangeLogo(function(){
        // TweenLite.to("#duneBuggyLogoTitle", 0, {x:"-150%", y:"-4000%", scale:100});

        var elapsed = new Date().getTime()-startTime;
        var waitTime = 1000;

        var introAnim = function(){

            TweenLite.to("#prepreloader", 0.5, {opacity:0, onComplete:function(){

                aboveFoldWrapper.style.display = "block";
                belowFoldWrapper.style.display = "block";
                document.getElementById("canvasContainer").appendChild(arScene.canvas);
                arScene.animate();
                
                TweenLite.fromTo("#duneBuggyLogoTitle", 0.5, 
                    {x:"-125%", y:"-2200%", scale:60}, 
                    {x:"-50%", y:"-50%", scale:1.01, ease:Power0.easeOut, onComplete:function(){
                        TweenLite.to("#titleCard", .950, {y:"-100%", ease:Power4.easeInOut, delay:0.75});
                    }})

            }}); 
        }

        if(elapsed >= waitTime){
            introAnim();
        } else {
            setTimeout(introAnim, waitTime - elapsed)
        }
        
        
    })
}

function createOrangeLogo(callback){
    var canvas = document.createElement('canvas');
    canvas.id = "duneBuggyLogoTitle";
    canvas.width = 286;
    canvas.height = 375;
    var context = canvas.getContext('2d');
    var imgObj = new Image();
    imgObj.addEventListener('load', function(){
        console.log('imageLoaded!');
        context.fillStyle = 'rgb(246, 178, 47)';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.globalCompositeOperation = "destination-atop";
        context.drawImage(imgObj, 0, 0);

        document.getElementById("titleCard").appendChild(canvas);

        if(callback)callback();
    })
    imgObj.src = "images/duneBuggyLogo.png"
    
}



var portraitRatio = 800/10;

function toggleInfo(){
    showInfo = !showInfo;
    if(showInfo){
        aboveFoldWrapper.classList.add("info")
    } else {
        aboveFoldWrapper.classList.remove("info")
    }
}
addClickListener(document.getElementById("AboutBtn"), toggleInfo);
addClickListener(document.getElementById("aboutCloseIcon"), toggleInfo);


function showPopUp(imgURL, linkURL){
    document.getElementById("popUp").classList.add("show");
    document.getElementById("darken").classList.add("show");

    document.getElementById("QRImage").src = imgURL;
    document.getElementById("popUpLink").href = linkURL;

    if(linkURL == "#"){
        // coming soon
        document.getElementById("popUpContent").style.display = "none";
        document.getElementById("popUpComingSoon").style.display = "block";
    } else {
        document.getElementById("popUpContent").style.display = "block";
        document.getElementById("popUpComingSoon").style.display = "none";
    }
}
function closePopUp(imgURL, linkURL){
    document.getElementById("popUp").classList.remove("show");
    document.getElementById("darken").classList.remove("show");
}
addClickListener(document.getElementById("fbLink"), function(){
    showPopUp("images/FB_QRCode.png", "https://www.facebook.com/fbcameraeffects/tryit/1307754219431648/")
});
addClickListener(document.getElementById("instaLink"), function(){
    showPopUp("images/Insta_QRCode.png", "https://www.instagram.com/a/r/?effect_id=644885626038284")
});
addClickListener(document.getElementById("snapLink"), function(){
    showPopUp("images/snapcode.png", "https://www.snapchat.com/unlock/?type=SNAPCODE&uuid=29afe3e6d2344edf8af81d0e6b52056b&metadata=01")
});
addClickListener(document.getElementById("webARLink"), function(){
    showPopUp("images/WebAR_QRCode.png", "https://dunebuggy.oblio.io/webAR/")
});
addClickListener(document.getElementById("popUpCloseIcon"), closePopUp);
addClickListener(document.getElementById("darken"), closePopUp);


function startDriving(){
    document.body.classList.add("driving");
    arScene.autoDrive = false;
    TweenLite.to(arScene.camera.position, 0.75, {y: 70, z: 70, delay:0.5})
    // camera.position
}
function stopDriving(){
    document.body.classList.remove("driving");
    arScene.autoDrive = true;
    TweenLite.to(arScene.camera.position, 0.75, {y: 100, z: 100})
}
addClickListener(document.getElementById("driveHereBtn"), startDriving);
addClickListener(document.getElementById("upperLeftContent"), stopDriving);


function addClickListener(el, fn){
    var initTouch = function (e) {
        el.removeEventListener('touchstart', initTouch);
        this.initTouchListener = null;
        el.removeEventListener('click', fn);
        el.addEventListener('touchstart', fn);
        fn(e);
    }
    el.addEventListener("touchstart", initTouch);
    el.addEventListener("click", fn);
}

function resize(){
    var w = window.innerWidth;
    var h = window.innerHeight;

    var fontSize = Math.min(10, h/80);
    fontSize = Math.min(fontSize, w/56);
    aboveFoldWrapper.style.fontSize = fontSize+'px';
    document.getElementById("upperLeftContent").style.fontSize = fontSize+'px';    

    var portraitSwitch = ((w)>840*(fontSize/10))?false:true;
    if(portraitSwitch){
        document.body.classList.add("mobile")
    } else {
        document.body.classList.remove("mobile")
    }
        
    //size below the fold
    if(w > h){
        fontSize = Math.min(10, w/110);
        document.getElementById("drivingInstructions").style.fontSize = fontSize+'px';
        document.getElementById("inst_3").style.display = "flex";
        document.getElementById("inst_4").style.display = "flex";
    } else {
        fontSize = Math.min(10, w/42);
        document.getElementById("drivingInstructions").style.fontSize = fontSize+'px';
        document.getElementById("inst_3").style.display = "none";
        document.getElementById("inst_4").style.display = "none";
    }
}

window.onresize = resize;
resize();

window.main = new Main();

