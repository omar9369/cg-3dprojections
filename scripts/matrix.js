class Matrix {
    constructor(r, c) {
        this.rows = r;
        this.columns = c;
        this.data = [];
        var i, j;
        for (i = 0; i < this.rows; i++) {
            this.data.push([]);
            for (j = 0; j < this.columns; j++) {
                this.data[i].push(0);
            }
        }
    }

    set values(v) {
        var i, j, idx;
        // v is already a 2d array with dims equal to rows and columns
        if (v instanceof Array && v.length === this.rows && 
            v[0] instanceof Array && v[0].length === this.columns) {
            this.data = v;
        }
        // v is a flat array with length equal to rows * columns
        else if (v instanceof Array && typeof v[0] === 'number' &&
                 v.length === this.rows * this.columns) {
            idx = 0;
            for (i = 0; i < this.rows; i++) {
                for (j = 0; j < this.columns; j++) {
                    this.data[i][j] = v[idx];
                    idx++;
                }
            }
        }
        // not valid
        else {
            console.log("could not set values for " + this.rows + "x" + this.columns + " maxtrix");
        }
    }

    get values() {
        return this.data.slice();
    }

    // matrix multiplication (this * rhs)
    mult(rhs) {
        var result = null;
        var i, j, k, vals, sum;
        // ensure multiplication is valid
        if (rhs instanceof Matrix && this.columns === rhs.rows) {
            result = new Matrix(this.rows, rhs.columns);
            vals = result.values;
            for (i = 0; i < result.rows; i++) {
                for (j = 0; j < result.columns; j++) {
                    sum = 0;
                    for (k = 0; k < this.columns; k++) {
                        sum += this.data[i][k] * rhs.data[k][j]
                    }
                    vals[i][j] = sum;
                }
            }
            result.values = vals;
        }
        else {
            console.log("could not multiply - row/column mismatch");
        }
        return result;
    }
}

Matrix.multiply = function(...args) {
    var i;
    var result = null;
    // ensure at least 2 matrices
    if (args.length >= 2 && args.every((item) => {return item instanceof Matrix;})) {
        result = args[0];
        i = 1;
        while (result !== null && i < args.length) {
            result = result.mult(args[i]);
            i++;
        }
        if (args[args.length - 1] instanceof Vector) {
            result = new Vector(result);
        }
    }
    else {
        console.log("could not multiply - requires at least 2 matrices");
    }
    return result;
}


class Vector extends Matrix {
    constructor(n) {
        var i;
        if (n instanceof Matrix) {
            super(n.rows, 1);
            for (i = 0; i < this.rows; i++) {
                this.data[i][0] = n.data[i][0];
            }
        }
        else {
            super(n, 1);
        }
    }

    get x() {
        var result = null;
        if (this.rows > 0) {
            result = this.data[0][0];
        }
        return result;
    }

    get y() {
        var result = null;
        if (this.rows > 1) {
            result = this.data[1][0];
        }
        return result;
    }

    get z() {
        var result = null;
        if (this.rows > 2) {
            result = this.data[2][0];
        }
        return result;
    }

    get w() {
        var result = null;
        if (this.rows > 3) {
            result = this.data[3][0];
        }
        return result;
    }

    set x(val) {
        if (this.rows > 0) {
            this.data[0][0] = val;
        }
    }

    set y(val) {
        if (this.rows > 0) {
            this.data[1][0] = val;
        }
    }

    set z(val) {
        if (this.rows > 0) {
            this.data[2][0] = val;
        }
    }

    set w(val) {
        if (this.rows > 0) {
            this.data[3][0] = val;
        }
    }

    magnitude() {
        var i;
        var sum = 0;
        for (i = 0; i < this.rows; i++) {
            sum += this.data[i][0] * this.data[i][0];
        }
        return Math.sqrt(sum);
    }

    normalize() {
        var i;
        var mag = this.magnitude();
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] /= mag;
        }
    }

    scale(s) {
        var i;
        for (i = 0; i < this.rows; i++) {
            this.data[i][0] *= s;
        }
    }

    add(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] + rhs.data[i][0];
            }
        }
        return result;
    }

    subtract(rhs) {
        var i;
        var result = null;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            result = new Vector(this.rows);
            for (i = 0; i < this.rows; i++) {
                result.data[i][0] = this.data[i][0] - rhs.data[i][0];
            }
        }
        return result;
    }

    dot(rhs) {
        var i;
        var sum = 0;
        if (rhs instanceof Vector && this.rows === rhs.rows) {
            for (i = 0; i < this.rows; i++) {
                sum += this.data[i][0] * rhs.data[i][0];
            }
        }
        return sum;
    }

    cross(rhs) {
        var result = null;
        if (rhs instanceof Vector && this.rows === 3 && rhs.rows === 3) {
            result = new Vector(3);
            result.values = [this.data[1][0] * rhs.data[2][0] - this.data[2][0] * rhs.data[1][0],
                             this.data[2][0] * rhs.data[0][0] - this.data[0][0] * rhs.data[2][0],
                             this.data[0][0] * rhs.data[1][0] - this.data[1][0] * rhs.data[0][0]]
        }
        return result;
    }
}



function mat4x4identity() {
    var result = new Matrix(4, 4);    
    return result;
}


function mat4x4translate(tx, ty, tz) {
    var result = new Matrix(4, 4);
    for (i = 0; i < 4; i++){
        result.data[i][i] = 1;
    }
    result.data[0][3] = tx;
    result.data[1][3] = ty;
    result.data[2][3] = tz;
    
    return result;
}

function mat4x4scale(sx, sy, sz) {
    var result = new Matrix(4, 4);

    result.data[0][0] = sx;
    result.data[1][1] = sy;
    result.data[2][2] = sz;
    result.data[3][3] = 1;
    return result;
}

function mat4x4rotatex(theta) {
    var result = new Matrix(4, 4);
    result.data[0][0] = 1;
    result.data[1][1] = Math.cos(theta);
    result.data[2][2] = Math.cos(theta);
    result.data[3][3] = 1;
    result.data[1][2] = -(Math.sin(theta));
    result.data[2][1] = Math.sin(theta);
    return result;
}


function mat4x4rotatey(theta) {
    var result = new Matrix(4, 4);
    result.data[0][0] = Math.cos(theta);
    result.data[1][1] = 1;
    result.data[2][2] = Math.cos(theta);
    result.data[3][3] = 1;
    result.data[2][0] = -(Math.sin(theta));
    result.data[0][2] = Math.sin(theta);
    return result;
}


function mat4x4rotatez(theta) {
    var result = new Matrix(4, 4);
    result.data[0][0] = Math.cos(theta);
    result.data[0][1] = -(Math.sin(theta));
    result.data[1][1] = Math.cos(theta);
    result.data[2][2] = 1;
    result.data[3][3] = 1;
    result.data[1][0] = Math.sin(theta);
    
    return result;
}

function mat4x4shearxy(shx, shy) {
    var result = new Matrix(4, 4);
    for (i = 0; i < 4; i++){
        result.data[i][i] = 1;
    }
    result.data[0][2] = shx;
    result.data[1][2] = shy;
    
    return result;
}

function mat4x4parallel(vrp, vpn, vup, prp, clip) {
    var shx_par, shy_par, shear_cw, DOP, cw, cw_x, cw_y, T_par, x_avg, y_avg, z_avg, v_axis, n_axis, u_axis, trans_vrp, rotate;
    // 1. translate VRP to the origin
    trans_vrp = mat4x4translate(-(vrp.x), -(vrp.y), -(vrp.z));
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, 
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    n_axis = new Vector3(vpn.x, vpn.y, vpn.z);
    n_axis.normalize();
    u_axis = vup.cross(n_axis)
    u_axis.normalize();
    v_axis = n_axis.cross(u_axis);
    rotate = new Matrix(4,4);
    rotate.values = [[u_axis.x, u_axis.y, u_axis.z, 0],
                     [v_axis.x, v_axis.y, v_axis.z, 0],
                     [n_axis.x, n_axis.y, n_axis.z, 0],
                     [0, 0, 0, 1]]
    // 3. shear such that the DOP becomes parallel to the z-axis
    x_avg = (clip[1] + clip[0]) / 2;
    y_avg = (clip[3] + clip[2]) / 2;
    z_avg = 0;
    cw = new Vector3(x_avg, y_avg, z_avg);
    DOP = cw.subtract(prp);

    shx_par = (-DOP.x)/DOP.z;
    shy_par = (-DOP.y)/DOP.z;
    shear_cw = mat4x4shearxy(shx_par, shy_par);

    //Translate CWxy and front clipping plane to origin
    cw_x = (clip[1] + clip[0]) / 2;
    cw_y = (clip[3] + clip[2]) / 2;

    //is front clip[4] or clip[5]

    T_par = new Matrix(4,4);
    T_par.values = [[1, 0, 0, -cw_x],
                    [0, 1, 0, -cw_y],
                    [0, 0, 1, -(clip[4])],
                    [0, 0, 0, 1]]

    // 4. translate and scale into canonical view volume
    //    (x = [-1,1], y = [-1,1], z = [0,-1])
    var S_par_x, S_par_z, S_par_y, S_par, N_par, trans_vrp;
    S_par_x = 2 / (clip[1] - clip[0]);
    S_par_y = 2 / (clip[3] - clip[2]);
    S_par_z = 1 / (clip[4] - clip[5]);
    S_par = new Matrix(4,4);
    S_par.values = [[S_par_x, 0, 0, 0],
                    [0, S_par_y, 0, 0],
                    [0, 0, S_par_z, 0],
                    [0, 0, 0, 1]]
                    


    //Multiplying all together, Check if this is right!!!!!!!
    var N_par = Matrix.multiply(S_par, T_par, shear_cw, rotate, trans_vrp);
    console.log(N_par);
    return N_par;
}

function mat4x4perspective(vrp, vpn, vup, prp, clip) { 
    var DOP, cw, n_axis, u_axis, v_axis, trans_vrp, trans_prp, rotate, shx_par, shy_par, x_avg, y_avg, z,avg, shear_cw;
    // 1. translate VRP to the origin
    trans_vrp = mat4x4translate(-(vrp.x), -(vrp.y), -(vrp.z));
    // 2. rotate VRC such that n-axis (VPN) becomes the z-axis, 
    //    u-axis becomes the x-axis, and v-axis becomes the y-axis
    n_axis = new Vector3(vpn.x, vpn.y, vpn.z);
    n_axis.normalize();
    u_axis = vup.cross(n_axis)
    u_axis.normalize();
    v_axis = n_axis.cross(u_axis);
    rotate = new Matrix(4,4);
    rotate.values = [[u_axis.x, u_axis.y, u_axis.z, 0],
                     [v_axis.x, v_axis.y, v_axis.z, 0],
                     [n_axis.x, n_axis.y, n_axis.z, 0],
                     [0, 0, 0, 1]]
    
    // 3. translate PRP to the origin
    trans_prp = mat4x4translate(-(prp.x),-(prp.y),-(prp.z));

    // 4. shear such that the center line of the view volume becomes the z-axis
    x_avg = (clip[1] + clip[0]) / 2;
    y_avg = (clip[3] + clip[2]) / 2;
    z_avg = 0;

    cw = new Vector3(x_avg, y_avg, z_avg);
    DOP = cw.subtract(prp);

    shx_par = (-DOP.x)/DOP.z;
    shy_par = (-DOP.y)/DOP.z;
    
    shear_cw = mat4x4shearxy(shx_par, shy_par);

    // 5. scale into canonical view volume (truncated pyramid)
    //    (x = [z,-z], y = [z,-z], z = [-z_min,-1])
    var S_perx, S_pery, S_perz, N_per, S_per, back;
    back = clip [5]

    S_perx = (2 * -(prp.z))/((clip[1] - clip[0]) * (-(prp.z) + back));
    S_pery = (2 * -(prp.z))/((clip[3] - clip[2]) * (-(prp.z) + back));
    S_perz = (-1)/ (-(prp.z) + back);
    
    S_per = new Matrix(4,4);

    S_per.values = [[S_perx, 0, 0, 0],
                    [0, S_pery, 0, 0],
                    [0, 0, S_perz, 0],
                    [0, 0, 0, 1]]

    // clip against canonical view frustum
    var z_min = -(-(prp.z) + 1)/(-(prp.z) + -1);
    
//MPER WAS HERE

    N_per = Matrix.multiply(S_per, shear_cw, trans_prp, rotate, trans_vrp);

    return N_per;
}

function mat4x4mper(near) {
    // convert perspective canonical view volume into the parallel one
    var result = new Matrix(4, 4);    
    return result;
}

function Vector3(x, y, z) {
    var result = new Vector(3);
    result.values = [x, y, z];
    return result;
}

function Vector4(x, y, z, w) {
    var result = new Vector(4);
    result.values = [x, y, z, w];
    return result;
}
