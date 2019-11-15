//---------------------------------------------//
//GLOBAL VARIABLES
var view;
var ctx;
var scene;
var theta = 0;
var start_time;

var LEFT = 32;
var RIGHT = 16;
var BOTTOM = 8;
var TOP = 4;
var FRONT = 2;
var BACK = 1;
var z_min;
var vrp, vpn, vup, prp;

//---------------------------------------------------------//
// Initialization function - called when web page loads
function Init() {
    var w = 800;
    var h = 600;
    view = document.getElementById('view');
    view.width = w;
    view.height = h;
    start_time = performance.now();
    ctx = view.getContext('2d');
    

    // initial scene... feel free to change this
    scene = {
        view: {
            type: 'perspective',
            vrp: Vector3(20, 0, -30),
            vpn: Vector3(1, 0, 1),
            vup: Vector3(0, 1, 0),
            prp: Vector3(14, 20, 26),
            clip: [-20, 20, -4, 36, 1, -50]
            //u min u max, v min v max, z min z max
            //subtract the prp

        },
        models: [
            {
                type: 'generic',
                vertices: [
                    Vector4( 0,  0, -30, 1),
                    Vector4(20,  0, -30, 1),
                    Vector4(20, 12, -30, 1),
                    Vector4(10, 20, -30, 1),
                    Vector4( 0, 12, -30, 1),
                    Vector4( 0,  0, -60, 1),
                    Vector4(20,  0, -60, 1),
                    Vector4(20, 12, -60, 1),
                    Vector4(10, 20, -60, 1),
                    Vector4( 0, 12, -60, 1)
                ],
                // these are the index of vec
                edges: [
                    [0, 1, 2, 3, 4, 0],
                    [5, 6, 7, 8, 9, 5],
                    [0, 5],
                    [1, 6],
                    [2, 7],
                    [3, 8],
                    [4, 9]
                ],
                animation: {
                    axis: "y",
                    rps: 0.5
                }

            }
        ]
    };

    var x_min, x_max, y_min, y_max, z_min, z_max, x_avg, y_avg, z_avg;
    x_min = scene.models[0].vertices[0].x;
    x_max = scene.models[0].vertices[0].x;
    y_min = scene.models[0].vertices[0].y;
    y_max = scene.models[0].vertices[0].y;
    z_min = scene.models[0].vertices[0].z;
    z_max = scene.models[0].vertices[0].z;
    for(var i = 0; i < scene.models[0].vertices.length; i++){
        if(scene.models[0].vertices[i].x < x_min){
            x_min = scene.models[0].vertices[i].x;
        }else if(scene.models[0].vertices[i].x > x_max){
            x_max = scene.models[0].vertices[i].x;
        }else if(scene.models[0].vertices[i].y < y_min){
            y_min = scene.models[0].vertices[i].y;
        }
        else if(scene.models[0].vertices[i].y > y_max){
            y_max = scene.models[0].vertices[i].y;
        }
        else if(scene.models[0].vertices[i].z < z_min){
            z_min = scene.models[0].vertices[i].z;
        }
        else if(scene.models[0].vertices[i].z > z_max){
            z_max = scene.models[0].vertices[i].z;
        }
    }
    x_avg = (x_min + x_max) / 2;
    y_avg = (y_min + y_max) / 2;
    z_avg = (z_min + z_max) / 2;
    scene.models[0].middle = Vector3(x_avg, y_avg, z_avg);


    z_min = -(-(scene.view.prp.z) + scene.view.clip[4])/(-(scene.view.prp.z) + scene.view.clip[5]);
    // event handler for pressing arrow keys
    document.addEventListener('keydown', OnKeyDown, false);
    start_time = performance.now(); // current timestamp in milliseconds
	prev_time = start_time;
	window.requestAnimationFrame(Animate);
}

function OnKeyDown(event) {
    var n_axis = new Vector3(scene.view.vpn.x, scene.view.vpn.y, scene.view.vpn.z);
    n_axis.normalize();
    var u_axis = scene.view.vup.cross(n_axis);
    u_axis.normalize();
    var multMatrix;
    var multVector;
    var solution, vrp_x, vrp_y, vrp_z;

    switch (event.keyCode) {
        case 37: // LEFT Arrow
            console.log("left");
			multMatrix = new mat4x4translate(-u_axis.x,-u_axis.y,-u_axis.z);
			multVector = new Vector4(scene.view.vrp.x,scene.view.vrp.y,scene.view.vrp.z,1);	
            solution = Matrix.multiply(multMatrix, multVector);
            scene.view.vrp.x = solution.x;
            scene.view.vrp.y = solution.y;
            scene.view.vrp.z = solution.z;

            DrawScene();
            break;
        case 38: // UP Arrow
            console.log("up");
			multMatrix = new mat4x4translate(-n_axis.x,-n_axis.y,-n_axis.z);           
			multVector = new Vector4(scene.view.vrp.x,scene.view.vrp.y,scene.view.vrp.z,1);	
            solution = Matrix.multiply(multMatrix, multVector);
            scene.view.vrp.x = solution.x;
            scene.view.vrp.y = solution.y;
            scene.view.vrp.z = solution.z;

            DrawScene();
            break;
        case 39: // RIGHT Arrow
            console.log("right");
            multMatrix = new mat4x4translate(u_axis.x,u_axis.y,u_axis.z);
            multVector = new Vector4(scene.view.vrp.x,scene.view.vrp.y,scene.view.vrp.z,1);
            solution = Matrix.multiply(multMatrix, multVector);
            scene.view.vrp.x = solution.x;
            scene.view.vrp.y = solution.y;
            scene.view.vrp.z = solution.z;
            DrawScene();
            break;
        case 40: // DOWN Arrow
            console.log("down");
            multMatrix = new mat4x4translate(n_axis.x,n_axis.y,n_axis.z);
            multVector = new Vector4(scene.view.vrp.x,scene.view.vrp.y,scene.view.vrp.z,1);	
            solution = Matrix.multiply(multMatrix, multVector);
            scene.view.vrp.x = solution.x;
            scene.view.vrp.y = solution.y;
            scene.view.vrp.z = solution.z;
            console.log(multMatrix);
            DrawScene(); 
            break;
    }
}

function Animate(timestamp) {
    // step 1: calculate time (time since start) 
        //and/or delta time (time between successive frames)
    // step 2: transform models based on time or delta time
    // step 3: draw scene
    // step 4: request next animation frame (recursively calling same function)
    
    var time = timestamp - prev_time;
    prev_time = timestamp;
    var avg = new Vector(scene.models[0].middle); 


    //console.log(avg);
    
    var theta = (scene.models[0].animation.rps) * (2* Math.PI) * time/1000;
    //translate
    var trans_model = mat4x4translate(-avg.x, -avg.y, -avg.z);
    var rotate_model;
    //rotate
    if(scene.models[0].animation.axis === "x"){
        rotate_model = mat4x4rotatex(theta);
    }else if(scene.models[0].animation.axis === "y"){
        rotate_model = mat4x4rotatey(theta);
    }else{
        rotate_model = mat4x4rotatez(theta);
    }
    

    //translate
    var trans_back = mat4x4translate(avg.x, avg.y, avg.z);

    //multiply all together.
	var hold_vector;
	var newMatrix = new Matrix(4,4);
	var i;
    //loop through all vertices, apply this matrix to x_axis for x rotation
    console.log()
	for(i = 0; i < scene.models[0].vertices.length; i++)
	{    
        hold_vector = Vector4(scene.models[0].vertices[i].x,scene.models[0].vertices[i].y,scene.models[0].vertices[i].z,scene.models[0].vertices[i].w);
		newMatrix = Matrix.multiply(trans_back, rotate_model, trans_model, hold_vector);
		scene.models[0].vertices[i].x = newMatrix.x;
		scene.models[0].vertices[i].y = newMatrix.y;
		scene.models[0].vertices[i].z = newMatrix.z;
		scene.models[0].vertices[i].w = newMatrix.w;
    }
	
	// ... Step 3
    DrawScene();

	// ... Step 4S
    window.requestAnimationFrame(Animate);
}


function DrawScene() {
	view = document.getElementById('view');
    ctx.clearRect(0,0, view.width, view.height);
    vrp = scene.view.vrp;
    vpn = scene.view.vpn;
    vup = scene.view.vup;
    prp = scene.view.prp;
    var clip = scene.view.clip;
    var hold_x, hold_y, hold_z;
    var transscale = new Matrix(4,4);
    var w = view.width;
    var h = view.height;
    var vec;
    var final;
    var edge;
    var veclip;
    var veclip1;
    
    transscale.values = [[w/2, 0, 0, w/2],
                         [0, h/2, 0, h/2],
                         [0, 0, 1, 0],
                         [0, 0, 0, 1]]
    
    //Updates Vectors with Matrix
    if(scene.view.type === 'perspective'){
        var persp = mat4x4perspective(vrp, vpn, vup, prp, clip);
        vec = [];
        for(var i = 0; i < scene.models[0].vertices.length; i++){    
            //add also the rotation        
            vec.push(Matrix.multiply(persp, scene.models[0].vertices[i]));
        }
        
        //loop through the edges and draw the lines
        M_per = new Matrix(4,4);

        M_per.values = [[1, 0, 0, 0],
                        [0, 1, 0, 0],
                        [0, 0, 1, 0],
                        [0, 0, -1, 0]]

        for(var j = 0; j < scene.models[0].edges.length; j++){
            for(var k = 0; k < scene.models[0].edges[j].length-1; k=k+1){
                veclip = Vector3(vec[scene.models[0].edges[j][k]].x, vec[scene.models[0].edges[j][k]].y, vec[scene.models[0].edges[j][k]].z);
                veclip1 = Vector3(vec[scene.models[0].edges[j][k+1]].x, vec[scene.models[0].edges[j][k+1]].y, vec[scene.models[0].edges[j][k+1]].z);
               
                var lineToCheck = ClipLine(veclip, veclip1);
                if(lineToCheck !== null)
                {
                    //APPLY MATRICES
                    lineToCheck.pt0 = Matrix.multiply(transscale,M_per,lineToCheck.pt0);
                    lineToCheck.pt1 = Matrix.multiply(transscale,M_per,lineToCheck.pt1);
                    //DRAWLINE
                    DrawLine((lineToCheck.pt0.x)/(lineToCheck.pt0.w),(lineToCheck.pt0.y)/(lineToCheck.pt0.w),(lineToCheck.pt1.x)/(lineToCheck.pt1.w),(lineToCheck.pt1.y)/(lineToCheck.pt1.w));
                }

            }
        }

    }else{
        //Parallel clipping
        var paral = mat4x4parallel(vrp, vpn, vup, prp, clip);
        vec = [];
        for(var i = 0; i < scene.models[0].vertices.length; i++){
            vec.push(Matrix.multiply(paral, scene.models[0].vertices[i]));
        }
        for(var j = 0; j < scene.models[0].edges.length; j++){
            for(var k = 0; k < scene.models[0].edges[j].length-1; k=k+1){
                var veclip = Vector4(vec[scene.models[0].edges[j][k]].x, vec[scene.models[0].edges[j][k]].y, vec[scene.models[0].edges[j][k]].z, 1);
                var veclip1 = Vector4(vec[scene.models[0].edges[j][k+1]].x, vec[scene.models[0].edges[j][k+1]].y, vec[scene.models[0].edges[j][k+1]].z, 1);
                var lineToCheck = ClipLine(veclip, veclip1);
                console.log(lineToCheck);
                if(lineToCheck !== null)
                {
                    //APPLY MATRICES
                    lineToCheck.pt0 = Matrix.multiply(transscale, lineToCheck.pt0);
                    lineToCheck.pt1 = Matrix.multiply(transscale, lineToCheck.pt1);

                    //DRAWLINE
                    DrawLine((lineToCheck.pt0.x)/(lineToCheck.pt0.w),(lineToCheck.pt0.y)/(lineToCheck.pt0.w),(lineToCheck.pt1.x)/(lineToCheck.pt1.w),(lineToCheck.pt1.y)/(lineToCheck.pt1.w));
                }

            }
        }

    }
    //window.requestAnimationFrame(Animate);	
}


function LoadNewScene() {
    var scene_file = document.getElementById('scene_file');
    var reader = new FileReader();
    reader.onload = (event) => {
        scene = JSON.parse(event.target.result);
        scene.view.vrp = Vector3(scene.view.vrp[0], scene.view.vrp[1], scene.view.vrp[2]);
        scene.view.vpn = Vector3(scene.view.vpn[0], scene.view.vpn[1], scene.view.vpn[2]);
        scene.view.vup = Vector3(scene.view.vup[0], scene.view.vup[1], scene.view.vup[2]);
        scene.view.prp = Vector3(scene.view.prp[0], scene.view.prp[1], scene.view.prp[2]);

        for (let i = 0; i < scene.models.length; i++) {
            if (scene.models[i].type === 'generic') {
                for (let j = 0; j < scene.models[i].vertices.length; j++) {
                    scene.models[i].vertices[j] = Vector4(scene.models[i].vertices[j][0],
                                                          scene.models[i].vertices[j][1],
                                                          scene.models[i].vertices[j][2],
                                                          1);
                }
            }
            else {
                scene.models[i].center = Vector4(scene.models[i].center[0],
                                                 scene.models[i].center[1],
                                                 scene.models[i].center[2],
                                                 1);
            }
        }
        z_min = -(-(scene.view.prp.z) + 1)/(-(scene.view.prp.z) + -1);
        DrawScene();
    };
    reader.readAsText(scene_file.files[0], "UTF-8");
}

// Draw black 2D line with red endpoints 
function DrawLine(x1, y1, x2, y2) {
    ctx.strokeStyle = '#000000';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.fillRect(x1 - 2, y1 - 2, 4, 4);
    ctx.fillRect(x2 - 2, y2 - 2, 4, 4);
}

//--------------------------------------------------//
//CLIPPING FUNCTIONS
function getOutcode(pt){
    if(scene.view.type === "perspective"){
        var outcode = 0;
        if(pt.x < pt.z){
            outcode += LEFT;
        }
        else if(pt.x > -(pt.z)){
            outcode += RIGHT;
        }
        if(pt.y < pt.z){
            outcode += BOTTOM;
        }
        else if(pt.y > -(pt.z)){
            outcode += TOP;
        }
        if(pt.z > z_min){
            outcode += FRONT;
        }
        else if(pt.z < -1){
            outcode += BACK;
        }
    }else{
        if(pt.x < -1){
            outcode += LEFT;
        }
        else if(pt.x > 1){
            outcode += RIGHT;
        }
        if(pt.y < -1){
            outcode += BOTTOM;
        }
        else if(pt.y > 1){
            outcode += TOP;
        }
        if(pt.z > 0){
            outcode += FRONT;
        }
        else if(pt.z < -1){
            outcode += BACK;
        }
    }
    
    return outcode;
}


function ClipLine(pt0, pt1){
    var result = {pt0: null, pt1: null};
    var outcode0 = getOutcode(pt0);
    var outcode1 = getOutcode(pt1);
    var delta_x = pt1.x - pt0.x;
    var delta_y = pt1.y - pt0.y;
    var delta_z = pt1.z - pt0.z;
    var b = pt0.y - ((delta_y / delta_x) * pt0.x);

    var done = false;
    var t;
    //console.log(outcode0);
    if(scene.view.type === "perspective"){
        while (!done) {
            if((outcode0 | outcode1) === 0){ // trivial accept
                done = true;
                result.pt0 = Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
                result.pt1 = Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
            }
            else if((outcode0 & outcode1) !== 0) { // trivial reject
                done = true;
                result = null;
            }
            else{
                var selected_pt;
                var selected_outcode;
                if(outcode0 > 0){
                    selected_pt = pt0;
                    selected_outcode = outcode0;
                }
                else{
                    selected_pt = pt1;
                    selected_outcode = outcode1;
                }
                if((selected_outcode & LEFT) === LEFT){
                    t = ((-(selected_pt.x) + selected_pt.z)/(delta_x - delta_z));
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }
                else if ((selected_outcode & RIGHT ) === RIGHT){
                    t = ((selected_pt.x + selected_pt.z)/(-(delta_x) - delta_z));
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }
                else if ((selected_outcode & BOTTOM ) === BOTTOM){
                    t = ((-(selected_pt.y) + selected_pt.z)/(delta_y - delta_z));
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }
                else if ((selected_outcode & TOP) === TOP){
                    t = ((selected_pt.y + selected_pt.z)/(-(delta_y) - delta_z));
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }
                else if((selected_outcode & FRONT) === FRONT){
                    t = ((selected_pt.z - z_min)/(-(delta_z)));
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }else{
                    t = ((-(selected_pt.z) - 1)/(delta_z));
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }
                selected_outcode = getOutcode(selected_outcode);
                if(outcode0 > 0){
                    outcode0 = selected_outcode;
                }
                else{
                    outcode1 = selected_outcode;
                }
            }   
        }
    return result;
    }else{
        while (!done) {
            if((outcode0 | outcode1) === 0){ // trivial accept
                done = true;
                result.pt0 = Vector4(pt0.x, pt0.y, pt0.z, pt0.w);
                result.pt1 = Vector4(pt1.x, pt1.y, pt1.z, pt1.w);
            }
            else if((outcode0 & outcode1) !== 0) { // trivial reject
                done = true;
                result = null;
            }
            else{
                var selected_pt;
                var selected_outcode;
                if((selected_outcode & LEFT) === LEFT){
                    t = -1-(selected_pt.x)/delta_x;
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }else if ((selected_outcode & RIGHT) === RIGHT){
                    t = 1-(selected_pt.x)/delta_x;
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }else if((selected_outcode & BOTTOM) === BOTTOM){
                    t = -1-(selected_pt.y)/delta_y;
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);

                }else if((selected_outcode & TOP) === TOP){
                    t = 1-(selected_pt.y)/delta_y;
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                
                }else if ((selected_outcode & FRONT) === FRONT){
                    t = -1-(selected_pt.z)/delta_z;
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }else{
                    t = 1-(selected_pt.y)/delta_y;
                    selected_pt.x = selected_pt.x + t * (delta_x);
                    selected_pt.y = selected_pt.y + t * (delta_y);
                    selected_pt.z = selected_pt.z + t * (delta_z);
                }
                selected_outcode = getOutcode(selected_outcode);
                if(outcode0 > 0){
                    outcode0 = selected_outcode;
                }
                else{
                    outcode1 = selected_outcode;
                }
            }
        }
    }
    return result;
}