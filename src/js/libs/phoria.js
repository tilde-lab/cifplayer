/**
 * @fileoverview phoria - Utilities and helpers, including root namespace.
 * Polar/planer coordinate conversions and and polygon/line intersection methods - contribution from Ruan Moolman.
 * @author Kevin Roast
 * @date 10th April 2013
 */

// init glMatrix library - many small Arrays are faster without the use of Float32Array wrap/conversion
glMatrix.setMatrixArrayType(Array);

/**
 * Creates a new vec3 initialized with the given xyz tuple
 *
 * @param {x:0,y:0,z:0} xyz object property tuple
 * @returns {vec3} a new 3D vector
 */
vec3.fromXYZ = function(xyz) {
   var out = new Array(3);
   out[0] = xyz.x;
   out[1] = xyz.y;
   out[2] = xyz.z;
   return out;
};

/**
 * Creates a new xyz object initialized with the given vec3 values
 *
 * @param {vec3} 3D vector
 * @returns {x:0,y:0,z:0} a new xyz object property tuple
 */
vec3.toXYZ = function(vec) {
   return {x:vec[0], y:vec[1], z:vec[2]};
};

/**
 * Creates a new vec4 initialized with the given xyz tuple and w coordinate
 *
 * @param {x:0,y:0,z:0} xyz object property tuple
 * @param w {Number} w coordinate
 * @returns {vec4} a new 4D vector
 */
vec4.fromXYZ = function(xyz, w) {
   var out = new Array(4);
   out[0] = xyz.x;
   out[1] = xyz.y;
   out[2] = xyz.z;
   out[3] = w;
   return out;
};

/**
 * Creates a rotation matrix from the given yaw (heading), pitch (elevation) and roll (bank) Euler angles.
 * 
 * @param {mat4} out the receiving matrix
 * @param {mat4} a the matrix to rotate
 * @param {Number} yaw the yaw/heading angle in radians
 * @param {Number} pitch the pitch/elevation angle in radians
 * @param {Number} roll the roll/bank angle in radians
 * @returns {mat4} out
 */
mat4.fromYPR = function(yaw, pitch, roll) {
   var out = new Array(16);
   var angles0 = Math.sin(roll),
       angles1 = Math.cos(roll),
       angles2 = Math.sin(pitch),
       angles3 = Math.cos(pitch),
       angles4 = Math.sin(yaw),
       angles5 = Math.cos(yaw);
   
   out[0] = angles5 * angles1;
   out[4] = -(angles5 * angles0);
   out[8] = angles4;
   out[1] = (angles2 * angles4 * angles1) + (angles3 * angles0);
   out[5] = (angles3 * angles1) - (angles2 * angles4 * angles0);
   out[9] = -(angles2 * angles5);
   out[2] = (angles2 * angles0) - (angles3 * angles4 * angles1);
   out[6] = (angles2 * angles1) + (angles3 * angles4 * angles0);
   out[10] = angles3 * angles5;
   out[3] = 0;
   out[7] = 0;
   out[11] = 0;
   out[12] = 0;
   out[13] = 0;
   out[14] = 0;
   out[15] = 1;
   return out;
};

quat.fromYPR = function(yaw, pitch, roll) {
    var num9 = roll * 0.5;
    var num6 = Math.sin(num9);
    var num5 = Math.cos(num9);
    var num8 = pitch * 0.5;
    var num4 = Math.sin(num8);
    var num3 = Math.cos(num8);
    var num7 = yaw * 0.5;
    var num2 = Math.sin(num7);
    var num = Math.cos(num7);
    var out = new Array(4);
    out[0] = ((num * num4) * num5) + ((num2 * num3) * num6);
    out[1] = ((num2 * num3) * num5) - ((num * num4) * num6);
    out[2] = ((num * num3) * num6) - ((num2 * num4) * num5);
    out[3] = ((num * num3) * num5) + ((num2 * num4) * num6);
    return out;
};


/**
 * Phoria root namespace.
 *
 * @namespace Phoria
 */
if (typeof Phoria === "undefined" || !Phoria)
{
   var Phoria = {};
   
   // Global static Phoria constants
   Phoria.RADIANS = Math.PI/180.0;
   Phoria.TWOPI = Math.PI*2;
   Phoria.ONEOPI = 1.0/Math.PI;
   Phoria.PIO2 = Math.PI/2;
   Phoria.PIO4 = Math.PI/4;
   Phoria.EPSILON = 0.000001;
}


(function() {
   "use strict";

   Phoria.Util = {};
   
   /**
    * Utility to set up the prototype, constructor and superclass properties to
    * support an inheritance strategy that can chain constructors and methods.
    * Static members will not be inherited.
    * 
    * @param {Function} subc   the object to modify
    * @param {Function} superc the object to inherit
    * @param {Object} overrides  additional properties/methods to add to the
    *                            subclass prototype.  These will override the
    *                            matching items obtained from the superclass.
    */
   Phoria.Util.extend = function extend(subc, superc, overrides)
   {
      var F = function() {}, i;
      F.prototype = superc.prototype;
      subc.prototype = new F();
      subc.prototype.constructor = subc;
      subc.superclass = superc.prototype;
      if (superc.prototype.constructor == Object.prototype.constructor)
      {
         superc.prototype.constructor = superc;
      }
      
      if (overrides)
      {
         for (i in overrides)
         {
            if (overrides.hasOwnProperty(i))
            {
               subc.prototype[i] = overrides[i];
            }
         }
      }
   }
   
   /**
    * Augment an existing object prototype with additional properties and functions from another prototype.
    * 
    * @param {Object} r    Receiving object
    * @param {Object} s    Source object
    */
   Phoria.Util.augment = function augment(r, s)
   {
      for (var p in s.prototype)
      {
         if (typeof r.prototype[p] === "undefined")
         {
            r.prototype[p] = s.prototype[p];
         }
      }
   }
   
   /**
    * Merge two objects into a new object - does not affect either of the original objects.
    * Useful for Entity config default and user config merging.
    * Deep merge returning a combined object. The source overwrites the target if names match.
    * Nested Arrays contents including objects are also merged, source values for base datatypes win.
    */
   Phoria.Util.merge = function merge(target, src)
   {
      var array = Array.isArray(src),
          dst = array && [] || {};
      
      if (array)
      {
         target = target || [];
         dst = dst.concat(target);
         src.forEach(function(e, i)
         {
            if (typeof e === 'object')
            {
               dst[i] = Phoria.Util.merge(target[i], e);
            }
            else
            {
               // overwrite basic value types - source wins
               dst[i] = e;
            }
         });
      }
      else
      {
         if (target && typeof target === 'object')
         {
            Object.keys(target).forEach(function (key) {
               dst[key] = target[key];
            });
         }
         Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key])
            {
               dst[key] = src[key];
            }
            else
            {
               if (!target || !target[key])
               {
                  dst[key] = src[key];
               }
               else
               {
                  dst[key] = Phoria.Util.merge(target[key], src[key]);
               }
            }
         });
      }
      
      return dst;
   }

   /**
    * Deep combine a source object properties into a target object.
    * Like the merge function above, this will deep combine object and Arrays and the contents,
    * however it will overwrite the properties of the target when doing so.
    */
   Phoria.Util.combine = function combine(target, src)
   {
      var array = Array.isArray(src) && Array.isArray(target);
      if (array)
      {
         if (target.length < src.length) target.length = src.length
         src.forEach(function(e, i)
         {
            if (typeof e === 'object')
            {
               target[i] = target[i] || {};
               Phoria.Util.combine(target[i], e);
            }
            else
            {
               // overwrite basic value types - source wins
               target[i] = e;
            }
         });
      }
      else
      {
         Object.keys(src).forEach(function (key) {
            if (typeof src[key] !== 'object' || !src[key])
            {
               target[key] = src[key];
            }
            else
            {
               target[key] = target[key] || (Array.isArray(src[key]) ? [] : {});
               Phoria.Util.combine(target[key], src[key]);
            }
         });
      }
   }
   
   /**
    * Shallow and cheap (1 level deep only) clone for simple property based objects.
    * Properties are only safely copied if they are base datatypes or an array of such.
    * Should only be used for simple structures such as entity "style" objects.
    */
   Phoria.Util.clone = function clone(src)
   {
      var n = null,
          dst = {};
      for (var p in src)
      {
         n = src[p];
         if (Array.isArray(n))
         {
            dst[p] = [].concat(n);
         }
         else
         {
            dst[p] = n;
         }
      }
      return dst;
   }
   
   /**
    * Return true if the given mat4 is an identity (noop) matrix, false otherwise
    */
   Phoria.Util.isIdentity = function isIdentity(mat)
   {
      return (
         mat[0] === 1 && 
         mat[1] === 0 &&
         mat[2] === 0 &&
         mat[3] === 0 &&
         mat[4] === 0 &&
         mat[5] === 1 &&
         mat[6] === 0 &&
         mat[7] === 0 &&
         mat[8] === 0 &&
         mat[9] === 0 &&
         mat[10] === 1 &&
         mat[11] === 0 &&
         mat[12] === 0 &&
         mat[13] === 0 &&
         mat[14] === 0 &&
         mat[15] === 1);
   }

   /**
    * Calculate a vec4 normal vector from given tri coordinates
    */
   Phoria.Util.calcNormalVector = function calcNormalVector(x1, y1, z1, x2, y2, z2)
   {
      var v = vec4.fromValues(
         (y1 * z2) - (z1 * y2),
         -((z2 * x1) - (x2 * z1)),
         (x1 * y2) - (y1 * x2),
         0);
      // use vec3 here to save a pointless multiply * 0 and add op
      return vec3.normalize(v, v);
   }
   
   /**
    * Calculate the angle between two 3D vectors
    */
   Phoria.Util.thetaTo = function thetaTo(v1, v2)
   {
      return Math.acos(vec3.dot(v1, v2) / (Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]) * Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2])));
   }
   
   /**
    * Return a vec3 representing the average world coordinate for the given polygon vertices
    */
   Phoria.Util.averagePolyVertex = function averagePolyVertex(vertices, worldcoords)
   {
      for (var i=0,avx=0,avy=0,avz=0; i<vertices.length; i++)
      {
         avx += worldcoords[ vertices[i] ][0];
         avy += worldcoords[ vertices[i] ][1];
         avz += worldcoords[ vertices[i] ][2];
      }
      return vec3.fromValues(
         avx / vertices.length,
         avy / vertices.length,
         avz / vertices.length);
   }
   
   /**
    * Return the average Z coordinate for a list of coordinates
    */
   Phoria.Util.averageObjectZ = function averageObjectZ(coords)
   {
      var av = 0;
      for (var i=0; i<coords.length; i++)
      {
         av += coords[i][3];
      }
      return av / coords.length;
   }

   /**
    * Return an Array of a given length using the given factory function to populate each item
    */
   Phoria.Util.populateBuffer = function populateBuffer(len, fnFactory)
   {
      var array = new Array(len);
      for (var i=0; i<len; i++)
      {
         array[i] = fnFactory(i);
      }
      return array;
   }

   /**
    * Sort a list of polygons by the Z coordinates in the supplied coordinate list
    */
   Phoria.Util.sortPolygons = function sortPolygons(polygons, worldcoords)
   {
      for (var i=0,verts; i<polygons.length; i++)
      {
         verts = polygons[i].vertices;
         if (verts.length === 3)
         {
            polygons[i]._avz = (worldcoords[ verts[0] ][2] + worldcoords[ verts[1] ][2] + worldcoords[ verts[2] ][2]) * 0.333333;
         }
         else
         {
            polygons[i]._avz = (worldcoords[ verts[0] ][2] + worldcoords[ verts[1] ][2] + worldcoords[ verts[2] ][2] + worldcoords[ verts[3] ][2]) * 0.25;
         }
      }
      polygons.sort(function sortPolygonsZ(f1, f2) {
         return (f1._avz < f2._avz ? -1 : 1);
      });
   }

   /**
    * Sort a list of edges by the average Z coordinate of the two vertices that represent it each edge.
    */
   Phoria.Util.sortEdges = function sortEdges(edges, coords)
   {
      for (var i=0; i<edges.length; i++)
      {
         edges[i]._avz = (coords[ edges[i].a ][2] + coords[ edges[i].b ][2]) * 0.5;
      }
      edges.sort(function sortEdgesZ(f1, f2) {
         return (f1._avz < f2._avz ? -1 : 1);
      });
   }

   /**
    * Sort a list of points by the Z coordinate. A second list is supplied that will be sorted in
    * lock-step with the first list (to maintain screen and worldcoordinate list)
    */
   Phoria.Util.sortPoints = function sortPoints(coords, worldcoords)
   {
      // We need our own sort routine as we need to swap items within two lists during the sorting, as
      // they must be maintained in lock-step or the lighting processing (using matching worldcoord indexes)
      // will produce incorrect results
      var quickSort = function qSort(c, a, start, end) {
         if (start < end) {
            var pivotIndex = (start + end) >> 1,
                pivotValue = a[pivotIndex][2],
                pivotIndexNew = start;
            
            var tmp = a[pivotIndex];
            a[pivotIndex] = a[end];
            a[end] = tmp;
            tmp = c[pivotIndex];
            c[pivotIndex] = c[end];
            c[end] = tmp;
            
            for (var i = start; i < end; i++)
            {
               if (a[i][2] > pivotValue)
               {
                  tmp = c[i];
                  c[i] = c[pivotIndexNew];
                  c[pivotIndexNew] = tmp;
                  tmp = a[i];
                  a[i] = a[pivotIndexNew];
                  a[pivotIndexNew] = tmp;
                  
                  pivotIndexNew++;
               }
            }
            
            tmp = c[pivotIndexNew];
            c[pivotIndexNew] = c[end];
            c[end] = tmp;
            tmp = a[pivotIndexNew];
            a[pivotIndexNew] = a[end];
            a[end] = tmp;
            
            qSort(c, a, start, pivotIndexNew-1);
            qSort(c, a, pivotIndexNew+1, end);
         }
      };
      quickSort(worldcoords, coords, 0, coords.length - 1);
   }
   
   /**
    * Generates an object of a subdivided plane 0-1 in the x-z plane
    * 
    * @param vsegs   Number of vertical segments
    * @param hsegs   Number of horizontal segments
    * @param level   TODO: Subdivision level, 0-2 (quads, 2 tris, 4 tris)
    * @param scale   Scale of the plane - 1.0 is a unit plane centred on the origin
    */
   Phoria.Util.generateTesselatedPlane = function generateTesselatedPlane(vsegs, hsegs, level, scale, generateUVs)
   {
      var points = [], edges = [], polys = [],
          hinc = scale/hsegs, vinc = scale/vsegs, c = 0;
      for (var i=0, x, y = scale/2; i<=vsegs; i++)
      {
         x = -scale/2;
         for (var j=0; j<=hsegs; j++)
         {
            // generate a row of points
            points.push( {x: x, y: 0, z: y} );
            
            // edges
            if (j !== 0)
            {
               edges.push( {a:c, b:c-1} );
            }
            if (i !== 0)
            {
               edges.push( {a:c, b:c-hsegs-1} );
            }

            if (i !== 0 && j !== 0)
            {
               // generate quad
               var p = {vertices:[c-hsegs-1, c, c-1, c-hsegs-2]};
               if (generateUVs)
               {
                  var uvs = [(1/hsegs) * j, (1/vsegs) * (i-1),
                             (1/hsegs) * j, (1/vsegs) * i,
                             (1/hsegs) * (j-1), (1/vsegs) * i,
                             (1/hsegs) * (j-1), (1/vsegs) * (i-1)];
                  p.uvs = uvs;
               }
               polys.push(p);
            }
            
            x += hinc;
            c++;
         }
         y -= vinc;
      }
      
      return {
         points: points,
         edges: edges,
         polygons: polys
      };
   }

   /**
    * Generate the geometry for a 1x1x1 unit cube
    * 
    * @param scale   optional scaling factor
    */
   Phoria.Util.generateUnitCube = function generateUnitCube(scale)
   {
      var s = scale || 1;
      return {
         points: [{x:-1*s,y:1*s,z:-1*s}, {x:1*s,y:1*s,z:-1*s}, {x:1*s,y:-1*s,z:-1*s}, {x:-1*s,y:-1*s,z:-1*s},
                  {x:-1*s,y:1*s,z:1*s}, {x:1*s,y:1*s,z:1*s}, {x:1*s,y:-1*s,z:1*s}, {x:-1*s,y:-1*s,z:1*s}],
         edges: [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
         polygons: [{vertices:[0,1,2,3]},{vertices:[1,5,6,2]},{vertices:[5,4,7,6]},{vertices:[4,0,3,7]},{vertices:[4,5,1,0]},{vertices:[3,2,6,7]}]
      };
   }

   /**
    * Generate the geometry for 1x1.5x1 unit square based pyramid
    * 
    * @param scale   optional scaling factor
    */
   Phoria.Util.generatePyramid = function generatePyramid(scale)
   {
      var s = scale || 1;
      return {
         points: [{x:-1*s,y:0,z:-1*s}, {x:-1*s,y:0,z:1*s}, {x:1*s,y:0,z:1*s}, {x:1*s,y:0*s,z:-1*s}, {x:0,y:1.5*s,z:0}],
         edges: [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:0,b:4}, {a:1,b:4}, {a:2,b:4}, {a:3,b:4}],
         polygons: [{vertices:[0,1,4]},{vertices:[1,2,4]},{vertices:[2,3,4]},{vertices:[3,0,4]},{vertices:[3,2,1,0]}]
      };
   }

   /**
    * Generate the geometry for a unit Icosahedron
    * 
    * @param scale   optional scaling factor
    */
   Phoria.Util.generateIcosahedron = function generateIcosahedron(scale)
   {
      // Generator code from "Tessellation of sphere" http://student.ulb.ac.be/~claugero/sphere/index.html
      var s = scale || 1;
      var t = (1+Math.sqrt(5))/2,
          tau = (t/Math.sqrt(1+t*t)) * s,
          one = (1/Math.sqrt(1+t*t)) * s;
      return {
         points: [{x:tau,y:one,z:0}, {x:-tau,y:one,z:0}, {x:-tau,y:-one,z:0}, {x:tau,y:-one,z:0}, {x:one,y:0,z:tau}, {x:one,y:0,z:-tau}, {x:-one,y:0,z:-tau}, {x:-one,y:0,z:tau}, {x:0,y:tau,z:one}, {x:0,y:-tau,z:one}, {x:0,y:-tau,z:-one}, {x:0,y:tau,z:-one}],
         edges: [{a:4,b:8}, {a:8,b:7}, {a:7,b:4}, {a:7,b:9}, {a:9,b:4}, {a:5,b:6}, {a:6,b:11}, {a:11,b:5}, {a:5,b:10}, {a:10,b:6}, {a:0,b:4}, {a:4,b:3}, {a:3,b:0}, {a:3,b:5}, {a:5,b:0}, {a:2,b:7}, {a:7,b:1}, {a:1,b:2}, {a:1,b:6}, {a:6,b:2}, {a:8,b:0}, {a:0,b:11}, {a:11,b:8}, {a:11,b:1}, {a:1,b:8}, {a:9,b:10}, {a:10,b:3}, {a:3,b:9}, {a:9,b:2}, {a:2,b:10}],
         polygons: [{vertices:[4, 8, 7]}, {vertices:[4, 7, 9]}, {vertices:[5, 6, 11]}, {vertices:[5, 10, 6]}, {vertices:[0, 4, 3]}, {vertices:[0, 3, 5]}, {vertices:[2, 7, 1]}, {vertices:[2, 1, 6]}, {vertices:[8, 0, 11]}, {vertices:[8, 11, 1]}, {vertices:[9, 10, 3]}, {vertices:[9, 2, 10]}, {vertices:[8, 4, 0]}, {vertices:[11, 0, 5]}, {vertices:[4, 9, 3]}, {vertices:[5, 3, 10]}, {vertices:[7, 8, 1]}, {vertices:[6, 1, 11]}, {vertices:[7, 2, 9]}, {vertices:[6, 10, 2]}]
      };
   }
   
   /**
    * Subdivide the given vertices and triangles - using a basic normalised triangle subdivision algorithm.
    * From OpenGL tutorial chapter "Subdividing to Improve a Polygonal Approximation to a Surface".
    * NOTE: this only works on triangles or quads not higher order polygons.
    * 
    * TODO: currently this subdivide does not reuse vertices that are shared by polygons!
    */
   Phoria.Util.subdivide = function subdivide(v, p)
   {
      var vertices = [],
          polys = [];
      
      var fnNormalize = function(vn) {
         var len = vn.x*vn.x + vn.y*vn.y + vn.z*vn.z;
         len = 1 / Math.sqrt(len);
         vn.x *= len;
         vn.y *= len;
         vn.z *= len;
      }
      var fnSubDivide = function(v1, v2, v3) {
         var v12 = {x:0,y:0,z:0}, v23 = {x:0,y:0,z:0}, v31 = {x:0,y:0,z:0};
         
         v12.x = v1.x+v2.x; v12.y = v1.y+v2.y; v12.z = v1.z+v2.z;
         v23.x = v2.x+v3.x; v23.y = v2.y+v3.y; v23.z = v2.z+v3.z;
         v31.x = v3.x+v1.x; v31.y = v3.y+v1.y; v31.z = v3.z+v1.z;
         
         fnNormalize(v12);
         fnNormalize(v23);
         fnNormalize(v31);
         
         var pn = vertices.length;
         vertices.push(v1,v2,v3,v12,v23,v31);
         polys.push({vertices: [pn+0, pn+3, pn+5]});
         polys.push({vertices: [pn+1, pn+4, pn+3]});
         polys.push({vertices: [pn+2, pn+5, pn+4]});
         polys.push({vertices: [pn+3, pn+4, pn+5]});
      }
      for (var i=0,vs; i<p.length; i++)
      {
         vs = p[i].vertices;
         if (vs.length === 3)
         {
            fnSubDivide.call(this, v[vs[0]], v[vs[1]], v[vs[2]]);
         }
         else if (vs.length === 4)
         {
            fnSubDivide.call(this, v[vs[0]], v[vs[1]], v[vs[2]]);
            fnSubDivide.call(this, v[vs[2]], v[vs[3]], v[vs[0]]);
         }
      }
      
      return {
         points: vertices,
         polygons: polys
      };
   }
   
   /**
    * Generate geometry for a cylinder
    * 
    * @param radius  Radius of the cylinder
    * @param length  Length of the cylinder
    * @param strips  Number of strips around the cylinder
    */
   Phoria.Util.generateCylinder = function generateCylinder(radius, length, strips)
   {
      var points = [], polygons = [], edges = [];
      var inc = 2*Math.PI / strips;
      for (var s=0, offset=0; s<=strips; s++)
      {
         points.push({
            x: Math.cos(offset) * radius,
            z: Math.sin(offset) * radius,
            y: length/2
         });
         points.push({
            x: Math.cos(offset) * radius,
            z: Math.sin(offset) * radius,
            y: -length/2
         });
         offset += inc;
         if (s !== 0)
         {
            // quad strip
            polygons.push({vertices: [s*2-2, s*2, s*2+1, s*2-1]});
            // edges
            edges.push({a:s*2, b:s*2-2},{a:s*2-2,b:s*2-1},{a:s*2+1,b:s*2-1});
            if (s === strips - 1)
            {
               // end cap polygons
               var vs = [];
               for (var i=strips; i>=0; i--) vs.push(i*2);
               polygons.push({vertices: vs});
               vs = [];
               for (var i=0; i<strips; i++) vs.push(i*2+1);
               polygons.push({vertices: vs});
            }
         }
      }
      return {
         points: points,
         edges: edges,
         polygons: polygons
      };
   }

   /**
    * {
    *    scalex: 1,
    *    scaley: 1,
    *    scalez: 1,
    *    offsetx: 0,
    *    offsety: 0,
    *    offsetz: 0
    * }
    */
   Phoria.Util.generateCuboid = function generateCuboid(desc)
   {
      var scalex = desc.scalex || 1,
          scaley = desc.scaley || 1,
          scalez = desc.scalez || 1,
          offsetx = desc.offsetx || 0,
          offsety = desc.offsety || 0,
          offsetz = desc.offsetz || 0;
      return {
         points: [{x:-1*scalex,y:1*scaley,z:-1*scalez}, {x:1*scalex,y:1*scaley,z:-1*scalez}, {x:1*scalex,y:-1*scaley,z:-1*scalez}, {x:-1*scalex,y:-1*scaley,z:-1*scalez},
                  {x:-1*scalex,y:1*scaley,z:1*scalez}, {x:1*scalex,y:1*scaley,z:1*scalez}, {x:1*scalex,y:-1*scaley,z:1*scalez}, {x:-1*scalex,y:-1*scaley,z:1*scalez}],
         edges: [{a:0,b:1}, {a:1,b:2}, {a:2,b:3}, {a:3,b:0}, {a:4,b:5}, {a:5,b:6}, {a:6,b:7}, {a:7,b:4}, {a:0,b:4}, {a:1,b:5}, {a:2,b:6}, {a:3,b:7}],
         polygons: [{vertices:[0,1,2,3]},{vertices:[0,4,5,1]},{vertices:[1,5,6,2]},{vertices:[2,6,7,3]},{vertices:[4,0,3,7]},{vertices:[5,4,7,6]}]
      };
   }

   /**
    * Generate the geometry for a sphere - triangles form the top and bottom segments, quads form the strips.
    */
   Phoria.Util.generateSphere = function generateSphere(scale, lats, longs, generateUVs)
   {
      var points = [], edges = [], polys = [], uvs = [];

      for (var latNumber = 0; latNumber <= lats; ++latNumber)
      {
         for (var longNumber = 0; longNumber <= longs; ++longNumber)
         {
            var theta = latNumber * Math.PI / lats;
            var phi = longNumber * 2 * Math.PI / longs;
            var sinTheta = Math.sin(theta);
            var sinPhi = Math.sin(phi);
            var cosTheta = Math.cos(theta);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            if (generateUVs)
            {
               var u = longNumber/longs;
               var v = latNumber/lats;
               uvs.push({u: u, v: v});
            }
            points.push({
               x: scale * x,
               y: scale * y,
               z: scale * z});
         }
      }

      for (var latNumber = 0; latNumber < lats; ++latNumber)
      {
         for (var longNumber = 0; longNumber < longs; ++longNumber)
         {
            var first = (latNumber * (longs+1)) + longNumber;
            var second = first + longs + 1;
            
            if (latNumber === 0)
            {
               // top triangle
               var p = {vertices: [first+1, second+1, second]};
               if (generateUVs)
               {
                  p.uvs = [uvs[first+1].u, uvs[first+1].v, uvs[second+1].u, uvs[second+1].v, uvs[second].u, uvs[second].v]
               }
               polys.push(p);
               edges.push({a:first, b:second});
            }
            else if (latNumber === lats-1)
            {
               // bottom triangle
               var p = {vertices: [first+1, second, first]};
               if (generateUVs)
               {
                  p.uvs = [uvs[first+1].u, uvs[first+1].v, uvs[second].u, uvs[second].v, uvs[first].u, uvs[first].v]
               }
               polys.push(p);
               edges.push({a:first, b:second});
            }
            else
            {
               // quad strip
               var p = {vertices: [first+1, second+1, second, first]};
               if (generateUVs)
               {
                  p.uvs = [uvs[first+1].u, uvs[first+1].v, uvs[second+1].u, uvs[second+1].v, uvs[second].u, uvs[second].v, uvs[first].u, uvs[first].v]
               }
               polys.push(p);
               edges.push({a:first, b:second});
               edges.push({a:second, b:second+1});
            }
         }
      }

      return {
         points: points,
         edges: edges,
         polygons: polys
      };
   }

   /**
    * Generate an Image for a radial gradient, with the given inner and outer colour stops.
    * Useful to generate quick sprite images of blurred spheres for explosions, particles etc.
    */
   Phoria.Util.generateRadialGradientBitmap = function generateRadialGradientBitmap(size, innerColour, outerColour)
   {
      var buffer = document.createElement('canvas'),
          width = size << 1;
      buffer.width = buffer.height = width;
      var ctx = buffer.getContext('2d'),
          radgrad = ctx.createRadialGradient(size, size, size >> 1, size, size, size);  
      radgrad.addColorStop(0, innerColour);
      radgrad.addColorStop(1, outerColour);
      ctx.fillStyle = radgrad;
      ctx.fillRect(0, 0, width, width);
      var img = new Image();
      img.src = buffer.toDataURL("image/png");
      return img;
   }
   
   /**
    * Make an XHR request for a resource. E.g. for loading a 3D object file format or similar.
    * 
    * @param config  JavaScript object describing the url, method, callback and so on for the request:
    *    {
    *       url: url                      // url of resource (mandatory)
    *       method: "GET"                 // HTTP method - default is GET
    *       overrideMimeType: mimetype    // optional mimetype override for response stream
    *       requestContentType: mimetype  // optional request Accept content-type
    *       fnSuccess: function           // success handler function - function(responseText, responseJSON)
    *       fnFailure: function           // failure handler function - function(responseText, responseJSON)
    *       data: string                  // data for POST or PUT method
    *    }
    */
   Phoria.Util.request = function request(config)
   {
      var req = new XMLHttpRequest();
      var data = config.data || "";
      if (config.responseContentType && req.overrideMimeType) req.overrideMimeType(config.responseContentType);
      req.open(config.method ? config.method : "GET", config.url);
      if (config.requestContentType) req.setRequestHeader("Accept", config.requestContentType);
      req.onreadystatechange = function() {
         if (req.readyState === 4)
         {
            if (req.status === 200)
            {
               // success - call handler
               if (config.fnSuccess)
               {
                  config.fnSuccess.call(this, req.responseText, req.status);
               }
            }
            else
            {
               // failure - call handler
               if (config.fnFailure)
               {
                  config.fnFailure.call(this, req.responseText, req.status);
               }
               else
               {
                  // default error handler
                  alert(req.status + "\n\n" + req.responseText);
               }
            }
         }
      };
      try
      {
         if (config.method === "POST" || config.method === "PUT")
         {
            req.send(data);
         }
         else
         {
            req.send(null);
         }
      }
      catch (e)
      {
         alert(e.message);
      }
   }
   
   /**
    * Geometry importer for Wavefront (.obj) text 3D file format. The url is loaded via an XHR
    * request and a callback function is executed on completion of the import and processing.
    * 
    * @param config  JavaScript object describing the url and configuration params for the import:
    *    {
    *       url: url             // url of resource (mandatory)
    *       fnSuccess: function  // callback function to execute once object is loaded - function({points:[], polygons:[]})
    *       fnFailure: function  // optional callback function to execute if an error occurs
    *       scale: 1.0           // optional scaling factor - 1.0 is the default
    *       scaleTo: 1.0         // optional automatically scale object to a specific size
    *       center: false        // optional centering of imported geometry to the origin
    *       reorder: false       // true to switch order of poly vertices if back-to-front ordering
    *    }
    */
   Phoria.Util.importGeometryWavefront = function importGeometryWavefront(config)
   {
      var vertex = [], faces = [], uvs = [];
      var re = /\s+/;   // 1 or more spaces can separate tokens within a line
      var scale = config.scale || 1;
      var minx, miny, minz, maxx, maxy, maxz;
      minx = miny = minz = maxx = maxy = maxz = 0;
      
      Phoria.Util.request({
         url: config.url,
         fnSuccess: function(data) {
            var lines = data.split('\n'); // split line by line
            for (var i = 0;i < lines.length;i++)
            {
               var line = lines[i].split(re);
               
               switch (line[0])
               {
                  case 'v':
                  {
                     var x = parseFloat(line[1])*scale,
                         y = parseFloat(line[2])*scale,
                         z = parseFloat(line[3])*scale;
                     vertex.push({'x': x, 'y': y, 'z': z});
                     if (x < minx) minx = x;
                     else if (x > maxx) maxx = x;
                     if (y < miny) miny = y;
                     else if (y > maxy) maxy = y;
                     if (z < minz) minz = z;
                     else if (z > maxz) maxz = z;
                  }
                  break;
                  
                  case 'vt':
                  {
                     var u = parseFloat(line[1]),
                         v = parseFloat(line[2]);
                     uvs.push([u,v]);
                  }
                  break;
                  
                  case 'f':
                  {
                     line.splice(0, 1); // remove "f"
                     var vertices = [], uvcoords = [];
                     for (var j = 0,vindex,vps; j < line.length; j++)
                     {
                        vindex = line[config.reorder ? line.length - j - 1 : j];
                        // deal with /r/n line endings
                        if (vindex.length !== 0)
                        {
                           // OBJ format vertices are indexed from 1
                           vps = vindex.split('/');
                           vertices.push(parseInt(vps[0]) - 1);
                           // gather texture coords
                           if (vps.length > 1 && vindex.indexOf("//") === -1)
                           {
                              var uv = parseInt(vps[1]) - 1;
                              if (uvs.length > uv)
                              {
                                 uvcoords.push(uvs[uv][0], uvs[uv][1]);
                              }
                           }
                        }
                     }
                     var poly = {'vertices': vertices};
                     faces.push(poly);
                     if (uvcoords.length !== 0) poly.uvs = uvcoords;
                  }
                  break;
               }
            }
            if (config.center)
            {
               // calculate centre displacement for object and adjust each point
               var cdispx = (minx + maxx)/2.0,
                   cdispy = (miny + maxy)/2.0,
                   cdispz = (minz + maxz)/2.0;
               for (var i=0; i<vertex.length; i++)
               {
                  vertex[i].x -= cdispx;
                  vertex[i].y -= cdispy;
                  vertex[i].z -= cdispz;
               }
            }
            if (config.scaleTo)
            {
               // calc total size multipliers using max object limits and scale
               var sizex = maxx - minx,
                   sizey = maxy - miny,
                   sizez = maxz - minz;
         
               // find largest of multipliers and use it as scale factor
               var scalefactor = 0.0;
               if (sizey > sizex) 
               {
                  if (sizez > sizey) 
                  {
                     // use sizez
                     scalefactor = 1.0 / (sizez/config.scaleTo);
                  }
                  else
                  {
                     // use sizey
                     scalefactor = 1.0 / (sizey/config.scaleTo);
                  }
               }
               else if (sizez > sizex) 
               {
                  // use sizez
                  scalefactor = 1.0 / (sizez/config.scaleTo);
               }
               else 
               {
                  // use sizex
                  scalefactor = 1.0 / (sizex/config.scaleTo);
               }
               for (var i=0; i<vertex.length; i++)
               {
                  vertex[i].x *= scalefactor;
                  vertex[i].y *= scalefactor;
                  vertex[i].z *= scalefactor;
               }
            }
            if (config.fnSuccess)
            {
               config.fnSuccess.call(this, {
                  points: vertex,
                  polygons: faces
               });
            }
         },
         fnFailure: function(error) {
            if (config.fnFailure)
            {
               config.fnFailure.call(this, error);
            }
         }
      });
   }
   
   Phoria.Util.calculatePolarFromPlanar = function calculatePolarFromPlanar(planar)
   {
      // array positions correspond to: r = [0], t = [1], p = [2]
      var point = new vec3.create();
      // r is radius and equals the length of the planar vector
      point[0] = vec3.length(planar);
      // t is theta and represents the vertical angle from the z axis to the point
      point[1] = Math.acos(planar[2] / point[0]);
      // p is phi and represents the horizontal angle from the x axis to the point
      if (planar[0] !== 0)
      {
         if (planar[0] > 0)
            point[2] = Math.atan(planar[1] / planar[0]);
         else
            point[2] = Math.PI + Math.atan(planar[1] / planar[0]);
      }
      // if x = 0
      else
      {
         if (planar[1] > 0)
            point[2] = Math.PI / 2;
         else
            point[2] = Math.PI * 3 / 2;
      }
      return point;
   }

   Phoria.Util.calculatePlanarFromPolar = function calculatePlanarFromPolar(polar)
   {
      return new vec3.fromValues(
         // calculate x value from polar coordinates
         Math.round(polar[0] * Math.sin(polar[1]) * Math.cos(polar[2]) * 100) / 100,
         // calculate y value from polar coordinates
         Math.round(polar[0] * Math.sin(polar[1]) * Math.sin(polar[2]) * 100) / 100,
         // calculate z value from polar coordinates
         Math.round(polar[0] * Math.cos(polar[1]) * 100) / 100);
   }

   Phoria.Util.planeLineIntersection = function planeLineIntersection(planeNormal, planePoint, lineVector, linePoint)
   {
      // planeNormal . (plane - planePoint) = 0
      // line = linePoint + lineScalar * lineVector
      // intersect where line = plane, thus
      // planeNormal . (linePoint + lineScalar * lineVector - planePoint) = 0
      // giving: lineScalar = planeNormal . (planePoint - linePoint) / planeNormal . lineVector
      var dotProduct = vec3.dot(lineVector, planeNormal);
      // check that click vector is not parallel to polygon
      if (dotProduct !== 0)
      {
         var pointVector = new vec3.create();
         vec3.subtract(pointVector, planePoint, linePoint);
         var lineScalar = vec3.dot(planeNormal, pointVector) / dotProduct;
         var intersection = vec3.create();
         vec3.scaleAndAdd(intersection, linePoint, lineVector, lineScalar);
         return intersection;
      }
      else
      {
         // return null if parallel, as the vector will never intersect the plane
         return null;
      }
   }

   Phoria.Util.intersectionInsidePolygon = function intersectionInsidePolygon(polygon, points, intersection)
   {
      // get absolute values of polygons normal vector
      var absNormal = vec3.fromValues(Math.abs(polygon._worldnormal[0]), Math.abs(polygon._worldnormal[1]), Math.abs(polygon._worldnormal[2]));
      // intersection counter
      var numIntersects = 0;
      // the vector for the test line, can be any 2D vector
      var testVector = vec2.fromValues(1, 1);

      // for every vertice of the polygon
      for (var l = 0; l < polygon.vertices.length; l++)
      {
         var point1, point2,
             intersection2D;

         // use orthogonal planes to check if the point is in shape in 2D
         // the component with the highest normal value is dropped
         // as this gives the best approximation of the original shape

         // drop z coordinates
         if (absNormal[2] >= absNormal[0] && absNormal[2] >= absNormal[1])
         {
            point1 = vec2.fromValues(points[polygon.vertices[l]][0], points[polygon.vertices[l]][1]);
            point2;
            if (l < polygon.vertices.length - 1)
               point2 = vec2.fromValues(points[polygon.vertices[l + 1]][0], points[polygon.vertices[l + 1]][1]);
            else
               point2 = vec2.fromValues(points[polygon.vertices[0]][0], points[polygon.vertices[0]][1]);

            intersection2D = vec2.fromValues(intersection[0], intersection[1]);
         }
         // drop y coordinates
         else if (absNormal[1] > absNormal[0])
         {
            point1 = vec2.fromValues(points[polygon.vertices[l]][2], points[polygon.vertices[l]][0]);
            point2;
            if (l < polygon.vertices.length - 1)
               point2 = vec2.fromValues(points[polygon.vertices[l + 1]][2], points[polygon.vertices[l + 1]][0]);
            else
               point2 = vec2.fromValues(points[polygon.vertices[0]][2], points[polygon.vertices[0]][0]);

            intersection2D = vec2.fromValues(intersection[2], intersection[0]);
         }
         // drop x coordinates
         else
         {
            point1 = vec2.fromValues(points[polygon.vertices[l]][1], points[polygon.vertices[l]][2]);
            point2;
            if (l < polygon.vertices.length - 1)
               point2 = vec2.fromValues(points[polygon.vertices[l + 1]][1], points[polygon.vertices[l + 1]][2]);
            else
               point2 = vec2.fromValues(points[polygon.vertices[0]][1], points[polygon.vertices[0]][2]);

            intersection2D = vec2.fromValues(intersection[1], intersection[2]);
         }

         // check if the vector from the intersection point intersects the line section
         if (Phoria.Util.sectionLineIntersect2D(point1, point2, intersection2D, testVector))
         {
            // increase intersect counter
            numIntersects++;
         }
      }

      // uneven number of intersects, mean the point is inside the object
      // even number of intersects, means its outside
      return (numIntersects % 2 === 1);
   }

   Phoria.Util.sectionLineIntersect2D = function sectionLineIntersect2D(p1, p2, p, v)
   {
      // get line section's vector
      var s = vec2.create();
      vec2.subtract(s, p2, p1);

      // calculate cross product of line vectors
      var svCross = vec3.create();
      vec2.cross(svCross, s, v)

      // if lines are parallel, they will never intersect
      if (svCross[2] === 0)
         return false;

      // l1 = p1 + t * s
      // l2 = p + u * v
      // where l1 = l2 the lines intersect thus,
      // t = (p x v - p1 x v) / (s x v)
      var t = (p[0] * v[1] - p[1] * v[0] - p1[0] * v[1] + p1[1] * v[0]) / svCross[2];
      // if v's x value is 0, use the other equation to calculate scalar u.
      var u;
      if (v[0] !== 0)
         u = (p1[0] + t * s[0] - p[0]) / v[0];
      else
         u = (p1[1] + t * s[1] - p[1]) / v[1];

      // intersection point
      var ip = vec2.create();
      vec2.scaleAndAdd(ip, p1, s, t);

      // check if intersection is in the section line
      var doesIntersect = { x: false, y: false };

      // only check in positive direction of test vector
      if (u >= 0)
      {
         if (p1[0] > p2[0])
         {
            if (ip[0] <= p1[0] && ip[0] >= p2[0])
               doesIntersect.x = true;
         }
         else
         {
            if (ip[0] >= p1[0] && ip[0] <= p2[0])
               doesIntersect.x = true;
         }

         if (p1[1] > p2[1])
         {
            if (ip[1] <= p1[1] && ip[1] >= p2[1])
               doesIntersect.y = true;
         }
         else
         {
            if (ip[1] >= p1[1] && ip[1] <= p2[1])
               doesIntersect.y = true;
         }
      }
      // return true if it is
      return (doesIntersect.x && doesIntersect.y);
   }

})();


/**
 * Image Preloader class. Executes the supplied callback function once all
 * registered images are loaded by the browser.
 * 
 * @class Phoria.Preloader
 */
(function() {
   "use strict";

   Phoria.Preloader = function()
   {
      this.images = [];
      return this;
   };
   
   Phoria.Preloader.prototype =
   {
      /**
       * Image list
       *
       * @property images
       * @type Array
       */
      images: null,
      
      /**
       * Callback function
       *
       * @property callback
       * @type Function
       */
      callback: null,
      
      /**
       * Images loaded so far counter
       */
      counter: 0,
      
      /**
       * Add an image to the list of images to wait for
       */
      addImage: function addImage(img, url)
      {
         var me = this;
         img.url = url;
         // attach closure to the image onload handler
         img.onload = function()
         {
            me.counter++;
            if (me.counter === me.images.length)
            {
               // all images are loaded - execute callback function
               me.callback.call(me);
            }
         };
         this.images.push(img);
      },
      
      /**
       * Load the images and call the supplied function when ready
       */
      onLoadCallback: function onLoadCallback(fn)
      {
         this.counter = 0;
         this.callback = fn;
         // load the images
         for (var i=0, j=this.images.length; i<j; i++)
         {
            this.images[i].src = this.images[i].url;
         }
      }
   };
})();
/**
 * @fileoverview phoria - 3D Entity objects. Base class for chained matrix operations. Concrete Entity implementations.
 * @author Kevin Roast
 * @date 13th April 2013
 */

(function() {
   "use strict";
   
   /**
    * BaseEntity is the base that other Entity prototypes extend from. Provides functions to perform chained matrix
    * operations and maintains the child entity list. It also provides the onScene event handler functions.
    */
   Phoria.BaseEntity = function()
   {
      // the model matrix for this object - live manipulation functions below
      this.matrix = mat4.create();
      this.children = [];
      
      return this;
   };
   
   /**
    * Factory create method - object literal Entity descripton:
    * {
    *    id: string,
    *    matrix: mat4,
    *    children: [...],
    *    onBeforeScene: function() {...},
    *    onScene: function() {...},
    *    disabled: boolean
    * }
    */
   Phoria.BaseEntity.create = function create(desc, e)
   {
      // merge structures to generate entity
      if (!e) e = new Phoria.BaseEntity();
      if (desc.id) e.id = desc.id;
      if (desc.matrix) e.matrix = desc.matrix;
      if (desc.children) e.children = desc.children;
      if (desc.onBeforeScene) e.onBeforeScene(desc.onBeforeScene);
      if (desc.onScene) e.onScene(desc.onScene);
      if (desc.disabled !== undefined) e.disabled = desc.disabled;
      
      return e;
   };
   
   Phoria.BaseEntity.prototype =
   {
      // {string} optional unique ID for direct look-up of entity during event handlers etc.
      id: null,

      // {Array} child objects for the purposes of affine transformations - parent matrix applied first
      // the child objects themselves can of course have further child objects
      children: null,
      
      // {mat4} matrix to be applied to the entity during scene processing
      matrix: null,

      // {boolean} set to true to disable processing of the Entity and all child entities during the modelView pipeline
      disabled: false,
      
      onBeforeSceneHandlers: null,
      onSceneHandlers: null,
      
      /**
       * Add an onBeforeSceneHandlers event handler function to the entity. Called at the start of each scene
       * processing cycle before the local matrix has been multipled by the parent matrix.
       * 
       * @param fn {function}    onBeforeSceneHandlers handler signature: function(Phoria.Scene, time) this = Phoria.Entity,
       *                         accepts [] of functions also
       */
      onBeforeScene: function onBeforeScene(fn)
      {
         if (this.onBeforeSceneHandlers === null) this.onBeforeSceneHandlers = [];
         this.onBeforeSceneHandlers = this.onBeforeSceneHandlers.concat(fn);
      },

      /**
       * Add an onScene event handler function to the entity. Called at the start of each scene processing cycle after the
       * local matrix has been multiplied by the parent matrix. 
       * 
       * @param fn {function}    onScene handler signature: function(Phoria.Scene, matLocal, time) this = Phoria.Entity,
       *                         accepts [] of functions also
       */
      onScene: function onScene(fn)
      {
         if (this.onSceneHandlers === null) this.onSceneHandlers = [];
         this.onSceneHandlers = this.onSceneHandlers.concat(fn);
      },

      identity: function identity()
      {
         mat4.identity(this.matrix);
         return this;
      },

      invert: function invert()
      {
         mat4.invert(this.matrix, this.matrix);
         return this;
      },

      multiply: function multiply(m)
      {
         mat4.multiply(this.matrix, this.matrix, m);
         return this;
      },

      scale: function scale(vec)
      {
         mat4.scale(this.matrix, this.matrix, vec);
         return this;
      },

      scaleN: function scale(n)
      {
         mat4.scale(this.matrix, this.matrix, vec3.fromValues(n,n,n));
         return this;
      },

      rotate: function rotate(rad, axis)
      {
         mat4.rotate(this.matrix, this.matrix, rad, axis);
         return this;
      },

      rotateX: function rotateX(rad)
      {
         mat4.rotateX(this.matrix, this.matrix, rad);
         return this;
      },

      rotateY: function rotateY(rad)
      {
         mat4.rotateY(this.matrix, this.matrix, rad);
         return this;
      },

      rotateZ: function rotateZ(rad)
      {
         mat4.rotateZ(this.matrix, this.matrix, rad);
         return this;
      },
      
      /**
       * Rotate entity matrix by the given yaw (heading), pitch (elevation) and roll (bank) Euler angles.
       * @param {Number} yaw the yaw/heading angle in radians
       * @param {Number} pitch the pitch/elevation angle in radians
       * @param {Number} roll the roll/bank angle in radians
       */
      rotateYPR: function rotateYPR(yaw, pitch, roll)
      {
         var m = mat4.fromYPR(yaw, pitch, roll);
         mat4.multiply(this.matrix, this.matrix, m);
      },

      translate: function translate(vec)
      {
         mat4.translate(this.matrix, this.matrix, vec);
         return this;
      },

      translateX: function translateX(n)
      {
         mat4.translate(this.matrix, this.matrix, vec3.fromValues(n,0,0));
         return this;
      },

      translateY: function translateY(n)
      {
         mat4.translate(this.matrix, this.matrix, vec3.fromValues(0,n,0));
         return this;
      },

      translateZ: function translateZ(n)
      {
         mat4.translate(this.matrix, this.matrix, vec3.fromValues(0,0,n));
         return this;
      },
      
      determinant: function determinant()
      {
         return mat4.determinant(this.matrix);
      },
      
      transpose: function transpose()
      {
         mat4.transpose(this.matrix, this.matrix);
         return this;
      }
   };
})();

Phoria.CLIP_ARRAY_TYPE = (typeof Uint32Array !== 'undefined') ? Uint32Array : Array;

(function() {
   "use strict";

   /**
    * Entity is the main Phoria 3D object class. It describes the vertices, edges, polygons and textures for a object
    * that can be rendered within a scene. Other classes sub-class this to provide more specialised entities such as
    * lights or Physics objects. The Entity also descibes a style structure that has a number of configuration settings
    * for different types and modes of rendering a 3D object.
    */
   Phoria.Entity = function()
   {
      Phoria.Entity.superclass.constructor.call(this);
      
      this.points = [];
      this.edges = [];
      this.polygons = [];
      this.textures = [];
      this.style = Phoria.Entity.createStyle();
      
      return this;
   };

   /**
    * Factory create method - object literal Entity descripton:
    * {
    *    points: [{x:0,y:0,z:0},...],
    *    edges: [{a:0,b:1},...],
    *    polygons: [{vertices:[7,8,10,9]},{vertices:[0,1,2],texture:0,uvs:[0,0,0.5,0.5,0.5,0]},...],
    *    style: {
    *       color: [128,128,128],      // RGB colour of the object surface
    *       specular: 0,               // if not zero, specifies specular shinyness power - e.g. values like 16 or 64
    *       diffuse: 1.0,              // material diffusion generally ranges from 0-1
    *       emit: 0.0,                 // material emission (glow) 0-1
    *       opacity: 1.0,              // material opacity 0-1
    *       drawmode: "solid",         // one of "point", "wireframe", "solid"
    *       shademode: "lightsource",  // one of "plain", "lightsource", "sprite", "callback" (only for point rendering)
    *       fillmode: "inflate",       // one of "fill", "filltwice", "inflate", "fillstroke", "hiddenline"
    *       objectsortmode: "sorted",  // coarse object sort - one of "sorted", "front", "back"
    *       geometrysortmode: "automatic",   // point, edge or polygon sorting mode - one of "sorted", "automatic", "none"
    *       linewidth: 1.0,            // wireframe line thickness
    *       linescale: 0.0,            // depth based scaling factor for wireframes - can be zero for no scaling
    *       doublesided: false,        // true to always render polygons - i.e. do not perform hidden surface test
    *       texture: undefined         // default texture index to use for polygons if not specified - e.g. when UVs are used
    *    },
    *    onRender: function() {...}
    * }
    */
   Phoria.Entity.create = function create(desc, e)
   {
      // merge structures to generate entity
      if (!e) e = new Phoria.Entity();
      Phoria.BaseEntity.create(desc, e);
      if (desc.points) e.points = desc.points;
      if (desc.polygons) e.polygons = desc.polygons;
      if (desc.edges) e.edges = desc.edges;
      if (desc.style) Phoria.Util.combine(e.style, desc.style);
      if (desc.onRender) e.onRender(desc.onRender);
      
      // generate normals - can call generate...() if manually changing points/polys at runtime
      e.generatePolygonNormals();
      // TODO: apply when gouraud shading for software rendering is added
      //e.generateVertexNormals();
      
      return e;
   };
   
   /**
    * Static helper to construct a default style object with all values populated.
    * 
    * @param s {Object}    Optional style object literal to merge into the default style.
    */
   Phoria.Entity.createStyle = function createStyle(s)
   {
      var style = {
         color: [128,128,128],
         diffuse: 1.0,
         specular: 0,
         drawmode: "solid",
         shademode: "lightsource",
         fillmode: "inflate",
         objectsortmode: "sorted",
         geometrysortmode: "automatic",
         linewidth: 1.0,
         linescale: 0.0,
         opacity: 1.0,
         doublesided: false
      };
      if (s) Phoria.Util.combine(style, s);
      return style;
   };
   
   Phoria.Util.extend(Phoria.Entity, Phoria.BaseEntity, {
      // {Array} list of {x:n,y:n,z:n} tuples describing the vertices of the entity
      points: null,
      
      // {Array} list of {a:n,b:n} objects describes the wireframe edges of the entity
      edges: null,
      
      // {Array} list of {vertices:[n,n,n,...],color:{r,g,b},texture:n} vertices array (minimum 3 per polygon) and
      // optional polygon color rgb tuple and optional texture index into the entity textures image list
      polygons: null,
      
      // {Object} style description for the entity - merged with the default style as defined in the constructor
      style: null,
      
      // {Array} list of texture images available to polygons
      textures: null,

      onRenderHandlers: null,
      
      _worldcoords: null,
      _cameracoords: null,
      _coords: null,
      _clip: null,
      _averagez: 0,
      _sorted: true,
      
      /**
       * Add an onRender event handler function to the entity. Called if shademode="callback" for custom rendering.
       * 
       * @param fn {function}    onRender handler signature: function(ctx, x, y, w) this = Phoria.Entity,
       *                         accepts [] of functions also
       */
      onRender: function onRender(fn)
      {
         if (this.onRenderHandlers === null) this.onRenderHandlers = [];
         this.onRenderHandlers = this.onRenderHandlers.concat(fn);
      },

      /**
       * Calculate and store the face normals for the entity
       */
      generatePolygonNormals: function generatePolygonNormals()
      {
         if (this.polygons)
         {
            // calculate normal vectors for face data - and set default colour
            // value if not supplied in the data set
            var points = this.points,
                polygons = this.polygons;
            for (var i=0, vertices, x1, y1, z1, x2, y2, z2; i<polygons.length; i++)
            {
               // First calculate normals from 3 points on the poly:
               // Vector 1 = Vertex B - Vertex A
               // Vector 2 = Vertex C - Vertex A
               vertices = polygons[i].vertices;
               x1 = points[vertices[1]].x - points[vertices[0]].x;
               y1 = points[vertices[1]].y - points[vertices[0]].y;
               z1 = points[vertices[1]].z - points[vertices[0]].z;
               x2 = points[vertices[2]].x - points[vertices[0]].x;
               y2 = points[vertices[2]].y - points[vertices[0]].y;
               z2 = points[vertices[2]].z - points[vertices[0]].z;
               // save the vec4 normal vector as part of the polygon data structure
               polygons[i].normal = Phoria.Util.calcNormalVector(x1, y1, z1, x2, y2, z2);
            }
         }
      },
      
      /**
       * Init all the buffers needed by the entity during scene pipeline processing.
       * Buffers are re-allocated if the number of coordinates in the entity changes.
       */
      initCoordinateBuffers: function initCoordinateBuffers()
      {
         var len = this.points.length;
         if (this._worldcoords === null || this._worldcoords.length < len)
         {
            this._worldcoords = new Array(len);
            for (var i=0; i<len; i++) this._worldcoords[i] = vec4.create();
         }
         if (this._cameracoords === null || this._cameracoords.length < len)
         {
            this._cameracoords = new Array(len);
            for (var i=0; i<len; i++) this._cameracoords[i] = vec4.create();
         }
         if (this._coords === null || this._coords.length < len)
         {
            this._coords = new Array(len);
            for (var i=0; i<len; i++) this._coords[i] = vec4.create();
         }
         if (this._clip === null || this._clip.length < len)
         {
            this._clip = new Phoria.CLIP_ARRAY_TYPE(len);
         }
      },
      
      /**
       * Return an object describing the bounding rectangle coordinates of the renderable object in screen coordinates.
       * @return an object with properties; minx, miny, maxx, maxy
       */
      getScreenBounds: function getScreenBounds()
      {
         var minx=10000,miny=10000,maxx=-10000,maxy=-10000;
         for (var i=0,p; i<this._coords.length; i++)
         {
            p = this._coords[i];
            if (p[0] < minx) minx = p[0];
            if (p[0] > maxx) maxx = p[0];
            if (p[1] < miny) miny = p[1];
            if (p[1] > maxy) maxy = p[1];
         }
         return {
            minx: minx,
            miny: miny,
            maxx: maxx,
            maxy: maxy
         };
      },
      
      /**
       * Return an object describing the bounding cube coordinates of the entity in world coordinates.
       * @return an object with properties; minx, miny, minz, maxx, maxy, maxz
       */
      getWorldBounds: function getWorldBounds()
      {
         var minx=10000,miny=10000,minz=10000,maxx=-10000,maxy=-10000,maxz=-10000;
         for (var i=0,p; i<this._worldcoords.length; i++)
         {
            p = this._worldcoords[i];
            if (p[0] < minx) minx = p[0];
            if (p[0] > maxx) maxx = p[0];
            if (p[1] < miny) miny = p[1];
            if (p[1] > maxy) maxy = p[1];
            if (p[2] < minz) minz = p[2];
            if (p[2] > maxz) maxz = p[2];
         }
         return {
            minx: minx,
            miny: miny,
            maxx: maxx,
            maxy: maxy,
            minz: minz,
            maxz: maxz
         };
      }
   });

   /**
    * Add debug information to an entity.
    * Debug config options:
    * {
    *    showId: boolean
    *    showAxis: boolean
    *    showPosition: boolean
    * }
    */
   Phoria.Entity.debug = function debug(entity, config)
   {
      // search child list for debug entity
      var id = "Phoria.Debug" + (entity.id ? (" "+entity.id) : "");
      var debugEntity = null;
      for (var i=0; i<entity.children.length; i++)
      {
         if (entity.children[i].id === id)
         {
            debugEntity = entity.children[i];
            break;
         }
      }
      
      // create debug entity if it does not exist
      if (debugEntity === null)
      {
         // add a child entity with a custom renderer - that renders text of the parent id at position
         debugEntity = new Phoria.Entity();
         debugEntity.id = id;
         debugEntity.points = [ {x:0,y:0,z:0} ];
         debugEntity.style = {
            drawmode: "point",
            shademode: "callback",
            geometrysortmode: "none",
            objectsortmode: "front"    // force render on-top of everything else
         };

         // config object - will be combined with input later
         debugEntity.config = {};

         debugEntity.onRender(function(ctx, x, y) {
            // render debug text
            ctx.fillStyle = "#333";
            ctx.font = "14pt Helvetica";
            var textPos = y;
            if (this.config.showId)
            {
               ctx.fillText(entity.id ? entity.id : "unknown - set Entity 'id' property", x, textPos);
               textPos += 16;
            }
            if (this.config.showPosition)
            {
               var p = entity.worldposition ? entity.worldposition : debugEntity._worldcoords[0];
               ctx.fillText("{x:" + p[0].toFixed(2) + ", y:" + p[1].toFixed(2) + ", z:" + p[2].toFixed(2) + "}", x, textPos);
            }
         });
         entity.children.push(debugEntity);

         // add visible axis geometry (lines) as children of entity for showAxis
         var fnCreateAxis = function(letter, vector, color) {
            var axisEntity = new Phoria.Entity();
            axisEntity.points = [ {x:0,y:0,z:0}, {x:2*vector[0],y:2*vector[1],z:2*vector[2]} ];
            axisEntity.edges = [ {a:0,b:1} ];
            axisEntity.style = {
               drawmode: "wireframe",
               shademode: "plain",
               geometrysortmode: "none",
               objectsortmode: "front",
               linewidth: 2.0,
               color: color
            };
            axisEntity.disabled = true;
            return axisEntity;
         };
         debugEntity.children.push(fnCreateAxis("X", vec3.fromValues(1,0,0), [255,0,0]));
         debugEntity.children.push(fnCreateAxis("Y", vec3.fromValues(0,1,0), [0,255,0]));
         debugEntity.children.push(fnCreateAxis("Z", vec3.fromValues(0,0,1), [0,0,255]));
      }

      // set the config
      Phoria.Util.combine(debugEntity.config, config);
      for (var i=0; i<debugEntity.children.length; i++)
      {
         debugEntity.children[i].disabled = !debugEntity.config.showAxis;
      }
   }

})();


(function() {
   "use strict";
   
   Phoria.PositionalAspect = {};
   
   /**
    * The PositionalAspect has defines a prototype for objects that may not be rendered directly (i.e. do not need
    * to have a visible entity) but do represent a position in the scene.
    * 
    * Augment a prototype with this aspect to provide an easy way to keep track of a it's position in the scene after
    * matrix transformations have occured. Examine worldposition at runtime (ensure not null) to get current position.
    * 
    * Set the initial position on object construction if the entity is not positioned at the origin by default.
    */
   Phoria.PositionalAspect.prototype =
   {
      // {xyz} the position of the entity
      position: null,
      // {vec4} the transformed world position of the entity
      worldposition: null,
      
      updatePosition: function updatePosition(matLocal)
      {
         // update worldposition position of emitter by local transformation -> world
         var vec = vec4.fromXYZ(this.position, 1);
         vec4.transformMat4(vec, vec, matLocal);
         this.worldposition = vec;
      }
   };
})();


(function() {
   "use strict";

   /**
    * PhysicsEntity builds on the basic entity class to provide very basic physics support. The entity maintains
    * a position and a velocity that can be manipulated via constant and impulse forces. It also optionally
    * applies gravity. After the physics calculations the entity matrix is updated to the new position.
    */
   Phoria.PhysicsEntity = function()
   {
      Phoria.PhysicsEntity.superclass.constructor.call(this);
      
      this.velocity = {x:0, y:0, z:0};
      this.position = {x:0, y:0, z:0};
      this._force = {x:0, y:0, z:0};
      this._acceleration = null;
      this.gravity = true;
      
      // add handlers to apply physics etc.
      this.onBeforeScene(this.applyPhysics);
      this.onScene(this.transformToScene);
      
      return this;
   };
   
   /**
    * Factory create method - object literal Entity descripton:
    * {
    *    velocity: {x:0,y:0,z:0},
    *    position: {x:0,y:0,z:0}, // NOTE: position is not render data - just informational for scene callbacks etc.
    *    force: {x:0,y:0,z:0},
    *    gravity: boolean
    * }
    */
   Phoria.PhysicsEntity.create = function create(desc)
   {
      // merge structures to generate entity
      var e = new Phoria.PhysicsEntity();
      Phoria.Entity.create(desc, e);
      if (desc.velocity) e.velocity = desc.velocity;
      if (desc.position) e.position = desc.position;
      if (desc.force) e._force = desc.force;
      if (desc.gravity !== undefined) e.gravity = desc.gravity;
      
      return e;
   };
   
   Phoria.Util.extend(Phoria.PhysicsEntity, Phoria.Entity, {
      // {xyz} current velocity of the entity
      velocity: null,
      
      // {boolean} true to automatically apply gravity force to the object, false otherwise
      gravity: false,
      
      _force: null,
      _acceleration: null,
      
      /**
       * Apply an impluse force to the entity
       * @param f {Object} xyz tuple for the force direction
       */
      impulse: function impulse(f)
      {
         this._acceleration = f;
      },
      
      /**
       * Apply a constant force to the entity
       * @param f {Object} xyz tuple for the force direction
       */
      force: function force(f)
      {
         this._force = f;
      },
      
      /**
       * Scene handler to apply basic physics to the entity.
       * Current velocity is updated by any acceleration that is set, by any constant
       * force that is set and also optionally by fixed gravity.
       */
      applyPhysics: function applyPhysics(scene)
      {
         /**
          * NOTE: Physics simulation is updated in real-time regardless of the FPS of
          *       the rest of the animation - set to ideal time (in secs) to avoid glitches
          */
         var time = 1000/60/1000;    // 60FPS in seconds
         var tt = time * time;
         
         // apply impulse force if set then reset it to none
         if (this._acceleration)
         {
            this.velocity.x += (this._acceleration.x * tt);
            this.velocity.y += (this._acceleration.y * tt);
            this.velocity.z += (this._acceleration.z * tt);
            this._acceleration = null;
         }
         // apply constant force
         if (this._force)
         {
            this.velocity.x += (this._force.x * tt);
            this.velocity.y += (this._force.y * tt);
            this.velocity.z += (this._force.z * tt);
         }
         // apply constant gravity force if activated
         if (this.gravity)
         {
            this.velocity.x += (Phoria.PhysicsEntity.GRAVITY.x * tt);
            this.velocity.y += (Phoria.PhysicsEntity.GRAVITY.y * tt);
            this.velocity.z += (Phoria.PhysicsEntity.GRAVITY.z * tt);
         }
         
         // apply current velocity to position
         this.translate(vec3.fromXYZ(this.velocity));
      },

      transformToScene: function transformToScene(scene, matLocal)
      {
         // local transformation -> world
         this.updatePosition(matLocal);
      }
   });
   Phoria.Util.augment(Phoria.PhysicsEntity, Phoria.PositionalAspect);
})();

/**
 * Constants
 */
Phoria.PhysicsEntity.GRAVITY = {x:0, y:-9.8, z:0};

(function() {
   "use strict";

   /**
    * Emitter is used to generate "particle" physics entities at a given rate per second with a flexible configuration
    * of velocity and position starting point. The emitter itself is not rendered, but exposes a style config that is
    * applied to all child particle entities. An event handler 'onParticle' is provided to allow further customisation
    * of particles as they are generated.
    */
   Phoria.EmitterEntity = function()
   {
      Phoria.EmitterEntity.superclass.constructor.call(this);

      this.position = {x:0,y:0,z:0};
      this.positionRnd = {x:0,y:0,z:0};
      this.velocity = {x:0,y:1,z:0};
      this.velocityRnd = {x:0,y:0,z:0};
      this.maximum = 1000;
      this.gravity = true;
      
      // default particle rendering style
      var style = Phoria.Entity.createStyle();
      style.drawmode = "point";
      style.shademode = "plain";
      style.geometrysortmode = "none";
      style.linewidth = 5;
      style.linescale = 2;
      this.style = style;
      
      this.textures = [];
      
      this._lastEmitTime = Date.now();
      
      // add handler to emit particles
      this.onScene(this.emitParticles);
      
      return this;
   };
   
   /**
    * Factory create method - object literal Entity descripton:
    * {
    *    position: {x:0,y:0,z:0},    // used as the start position for particles - default (0,0,0)
    *    positionRnd: {x:0,y:0,z:0}, // randomness to apply to the start position - default (0,0,0)
    *    rate: Number,               // particles per second to emit - default 0
    *    maximum: Number,            // maximum allowed particles (zero for unlimited) - default 1000
    *    velocity: {x:0,y:1,z:0},    // start velocity of the particle - default (0,1,0)
    *    velocityRnd: {x:0,y:0,z:0}, // randomness to apply to the velocity - default (0,0,0)
    *    lifetime: Number,           // lifetime in ms of the particle (zero for unlimited) - default 0
    *    lifetimeRnd: Number,        // lifetime randomness to apply - default 0
    *    gravity: boolean            // true to apply gravity to particles - default true
    *    style: {...}                // particle rendering style (@see Phoria.Entity)
    *    onParticle: function() {...}// particle create callback function
    * }
    */
   Phoria.EmitterEntity.create = function create(desc)
   {
      // TODO: provide an emitter() callback function - which could be used to apply velocity or whatever
      //       rather than assuming all particle generation will use the parameters below
      // merge structures to generate entity
      var e = new Phoria.EmitterEntity();
      Phoria.BaseEntity.create(desc, e);
      if (desc.position) e.position = desc.position;
      if (desc.positionRnd) e.positionRnd = desc.positionRnd;
      if (desc.rate) e.rate = desc.rate;
      if (desc.maximum) e.maximum = desc.maximum;
      if (desc.velocity) e.velocity = desc.velocity;
      if (desc.velocityRnd) e.velocityRnd = desc.velocityRnd;
      if (desc.lifetime) e.lifetime = desc.lifetime;
      if (desc.lifetimeRnd) e.lifetimeRnd = desc.lifetimeRnd;
      if (desc.gravity !== undefined) e.gravity = desc.gravity;
      if (desc.style) Phoria.Util.combine(e.style, desc.style);
      if (desc.onParticle) e.onParticle(desc.onParticle);
      
      return e;
   };
   
   Phoria.Util.extend(Phoria.EmitterEntity, Phoria.BaseEntity, {
      // {Object} style description for the entity - merged with the default style as defined in the constructor
      style: null,
      
      // {Number} output rate of the emitter in items per second
      rate: 0,
      
      // {Number} optional maximum number of particles allowed as children of the emitter
      maximum: 0,
      
      // {xyz} start velocity of the particles
      velocity: null,
      
      // {xyz} randomness to apply to the start velocity to particles
      velocityRnd: null,
      
      // {Number} lifetime of the particles in miliseconds 
      lifetime: 0,
      
      // {Number} randomness to apply to the lifetime of the particles
      lifetimeRnd: 0,
      
      // {boolean} true to automatically apply gravity force to the particles, false otherwise
      gravity: false,
      
      _lastEmitTime: 0,

      onParticleHandlers: null,
      
      /**
       * Add an onParticle event handler function to the entity. Typically used to decorate or modify a particle
       * before it is added to the emitter child list and begins it's lifecycle.
       * 
       * @param fn {function}    onParticle handler signature: function(particle) this = Phoria.EmitterEntity,
       *                         accepts [] of functions also
       */
      onParticle: function onParticle(fn)
      {
         if (this.onParticleHandlers === null) this.onParticleHandlers = [];
         this.onParticleHandlers = this.onParticleHandlers.concat(fn);
      },
      
      /**
       * Scene handler to generate child particles from the emitter.
       */
      emitParticles: function emitParticles(scene, matLocal, time)
      {
         // update worldposition position of emitter by local transformation -> world
         this.updatePosition(matLocal);
         
         // TODO: currently this assumes all direct children of the emitter are particles
         //       if they are not - this calculation needs to be changed to keep track.
         
         // clean up expired particles - based on lifetime
         var now = Date.now();
         for (var i=0, p; i<this.children.length; i++)
         {
            p = this.children[i];
            if (p._gravetime && now > p._gravetime)
            {
               // found a particle to remove
               this.children.splice(i, 1);
            }
         }
         
         // emit particle objects
         var since = now - this._lastEmitTime;
         var count = Math.floor((this.rate / 1000) * since);
         if (count > 0)
         {
            // emit up to count value - also checking maximum to ensure total particle count is met
            for (var c=0; c<count && (this.maximum === 0 || this.children.length < this.maximum); c++)
            {
               var pos = {x:this.position.x, y:this.position.y, z:this.position.z};
               pos.x += (Math.random() * this.positionRnd.x) - (this.positionRnd.x * 0.5);
               pos.y += (Math.random() * this.positionRnd.y) - (this.positionRnd.y * 0.5);
               pos.z += (Math.random() * this.positionRnd.z) - (this.positionRnd.z * 0.5);
               var vel = {x:this.velocity.x, y:this.velocity.y, z:this.velocity.z};
               vel.x += (Math.random() * this.velocityRnd.x) - (this.velocityRnd.x * 0.5);
               vel.y += (Math.random() * this.velocityRnd.y) - (this.velocityRnd.y * 0.5);
               vel.z += (Math.random() * this.velocityRnd.z) - (this.velocityRnd.z * 0.5);
               
               // create particle directly - avoid overhead of the more friendly factory method
               var particle = new Phoria.PhysicsEntity();
               particle.position = pos;
               particle.points = [ pos ];
               particle.velocity = vel;
               particle.gravity = this.gravity;
               particle.style = this.style;
               particle.textures = this.textures;
               if (this.lifetime !== 0)
               {
                  particle._gravetime = Math.floor(now + this.lifetime + (this.lifetimeRnd * Math.random()) - this.lifetimeRnd*0.5);
               }
               
               // execute any callbacks interested in the particle creation
               if (this.onParticleHandlers !== null)
               {
                  for (var h=0; h<this.onParticleHandlers.length; h++)
                  {
                     this.onParticleHandlers[h].call(this, particle);
                  }
               }
               
               this.children.push(particle);
            }
            this._lastEmitTime = now;
         }
      }
   });
   Phoria.Util.augment(Phoria.EmitterEntity, Phoria.PositionalAspect);
})();


(function() {
   "use strict";

   /**
    * BaseLight is the base that the Light classes extend from. Provides RGB color and light intensity properties.
    */
   Phoria.BaseLight = function()
   {
      Phoria.BaseLight.superclass.constructor.call(this);
      
      this.color = [1.0, 1.0, 1.0];
      this.intensity = 1.0;
      
      return this;
   };
   
   Phoria.Util.extend(Phoria.BaseLight, Phoria.BaseEntity, {
      // [r,g,b] - note! light colour component levels are specified from 0.0 - 1.0
      color: null,
      
      // {Number} light intensity typically between 0-1
      intensity: 0.0
   });
})();


(function() {
   "use strict";

   /**
    * DistantLight models an infinitely distant light that has no position only a normalised direction from which light eminates.
    */
   Phoria.DistantLight = function()
   {
      Phoria.DistantLight.superclass.constructor.call(this);
      
      // direction should be a normalised vector
      this.direction = {x:0, y:0, z:1};
      
      // add scene handler to transform the light direction into world direction
      this.onScene(this.transformToScene);
      
      return this;
   };
   
   /**
    * Factory create method - object literal Light descripton
    */
   Phoria.DistantLight.create = function create(desc)
   {
      // merge structures to generate entity
      var e = new Phoria.DistantLight();
      Phoria.BaseEntity.create(desc, e);
      if (desc.color) e.color = desc.color;
      if (desc.intensity) e.intensity = desc.intensity;
      if (desc.direction) e.direction = vec3.toXYZ(vec3.normalize(e.direction, vec3.fromXYZ(desc.direction)));
      
      return e;
   };
   
   Phoria.Util.extend(Phoria.DistantLight, Phoria.BaseLight, {
      // light direction
      direction: null,
      worlddirection: null,
      
      transformToScene: function transformToScene()
      {
         this.worlddirection = vec3.fromValues(
            -this.direction.x,
            -this.direction.y,
            -this.direction.z);
      }
   });
})();


(function() {
   "use strict";

   /**
    * PointLight models a light that has a position within the scene and from which light eminates in all directions
    * equally. These lights also have an attenuation which describes how the light falls off over distance. A number of
    * attentuation types are provided such as none (no fall-off over distance), linear (fall-off directly related to the
    * distance from the light) and squared (fall-off related to distance squared).
    */
   Phoria.PointLight = function()
   {
      Phoria.PointLight.superclass.constructor.call(this);
      
      this.position = {x: 0, y:0, z:-1};
      this.attenuation = 0.1;
      this.attenuationFactor = "linear";
      
      // add scene handler to transform the light position into world position
      this.onScene(this.transformToScene);
      
      return this;
   };
   
   /**
    * Factory create method - object literal Light descripton
    * {
    *    position: {x:0,y:0,z:0},
    *    color: [0-1,0-1,0-1],
    *    intensity: 0-1,
    *    attenuation: 0-1,
    *    attenuationFactor: "none"|"linear"|"squared"
    * }
    */
   Phoria.PointLight.create = function create(desc)
   {
      // merge structures to generate entity
      var e = new Phoria.PointLight();
      Phoria.BaseEntity.create(desc, e);
      if (desc.color) e.color = desc.color;
      if (desc.intensity) e.intensity = desc.intensity;
      if (desc.position) e.position = desc.position;
      if (desc.attenuation) e.attenuation = desc.attenuation;
      if (desc.attenuationFactor) e.attenuationFactor = desc.attenuationFactor;
      
      return e;
   };
   
   Phoria.Util.extend(Phoria.PointLight, Phoria.BaseLight, {
      // falloff
      attenuation: 0,
      attenuationFactor: null,
      
      transformToScene: function transformToScene(scene, matLocal, time)
      {
         // update worldposition position of light by local transformation -> world
         this.updatePosition(matLocal);
      }
   });
   Phoria.Util.augment(Phoria.PointLight, Phoria.PositionalAspect);
})();
/**
 * @fileoverview phoria - Scene renderers. Canvas renderer and prototype Software renderer.
 * @author Kevin Roast
 * @date 14th April 2013
 */

(function() {
   "use strict";

   /**
    * Base Renderer that defines helper functions used by specific rendering classes.
    */
   Phoria.Renderer = function()
   {
   };
   
   Phoria.Renderer.prototype = {
      // {boolean} true to sort the objects in the scene by average Z coordinate, false to render the list without sorting
      sort: true,
      
      /**
       * Sort the list of objects in the scene by average Z coordinate. Prepares the flattened render
       * list to be rendered object by object using the painters algorithm.
       * 
       * @param scene {Phoria.Scene}
       */
      sortObjects: function sortObjects(scene)
      {
         // calculate and sort objects in average Z order
         if (this.sort)
         {
            for (var n=0,obj; n<scene.renderlist.length; n++)
            {
               // ensure we have an average z coord for the objects to test
               obj = scene.renderlist[n];
               switch (obj.style.objectsortmode)
               {
                  case "sorted":
                     // average z coord is calculated during scene processing
                     break;
                  case "front":
                     // to the front - remember the Z direction is reversed
                     obj._averagez = Number.MIN_VALUE;
                     break;
                  case "back":
                  default:
                     // to the back - remember the Z direction is reversed
                     obj._averagez = Number.MAX_VALUE;
                     break;
               }
            }
            scene.renderlist.sort(function sortObjectsZ(a, b) {
               return (a._averagez < b._averagez ? 1 : -1);
            });
         }
      },

      /**
       * Calculate brightness for the normal based on a set of lights
       * 
       * @param position {vec3}        Position of the source polygon e.g. vertex or average poly point
       * @param normal {vec3}          Normal to calculate brightness against
       * @param scene {Phoria.Scene}   Scene - lights and current camera position are queried from here
       * @param obj {Phoria.Entity}    Object - style is used for diffuse/specular calculations
       * @return RGB float component array for final brightness - values added to current values
       */
      calcNormalBrightness: function calcNormalBrightness(position, normal, scene, obj)
      {
         var rgb = [0.0,0.0,0.0],
             lights = scene.lights;
         for (var e=0, light, brightness; e<lights.length; e++)
         {
            light = lights[e];
            
            if (light instanceof Phoria.DistantLight)
            {
               // Distant lights have no "position", just a direction - they light the world with parallel rays
               // from an infinitely distant location - closest example is light from the sun when overhead
               // note that light worlddirection is precalculated as negative.
               var dotVP = vec3.dot(normal, light.worlddirection);
               
               // don't waste any more time calculating if the dot product is negative i.e. > 90 degrees
               if (dotVP <= 0) continue;
               
               // combine light intensity with dot product and object diffuse value
               brightness = dotVP * light.intensity * obj.style.diffuse;
            }
            else if (light instanceof Phoria.PointLight)
            {
               // Point lights have a position and a fall-off known as attenuation
               // distance falloff calculation - each light is additive to the total
               var vecToLight = vec3.subtract(vec3.create(), position, light.worldposition),
                   distance = vec3.length(vecToLight),
                   attenuation;
               vec3.normalize(vecToLight, vecToLight);
               var dotVP = vec3.dot(normal, vec3.negate(vecToLight, vecToLight));
               
               // don't waste any more time calculating if the dot product is negative i.e. > 90 degrees
               if (dotVP <= 0) continue;
               
               switch (light.attenuationFactor)
               {
                  default:
                  case "none":
                     attenuation = light.attenuation;
                     break;
                  case "linear":
                     attenuation = light.attenuation * distance;
                     break;
                  case "squared":
                     attenuation = light.attenuation * distance * distance;
                     break;
               }
               
               // Optional specular highlight calculation
               if (obj.style.specular !== 0)
               {
                  var halfV = vec3.add(vec3.create(), vecToLight, scene._cameraPosition),
                      dotHV = vec3.dot(normal, vec3.normalize(halfV, halfV)),
                      pf = Math.pow(dotHV, obj.style.specular) * light.intensity / attenuation;
                  rgb[0] += pf * light.color[0];
                  rgb[1] += pf * light.color[1];
                  rgb[2] += pf * light.color[2];
               }
               
               brightness = obj.style.diffuse * dotVP * light.intensity / attenuation;
            }
            
            // apply each colour component based on light levels (0.0 to 1.0)
            rgb[0] += brightness * light.color[0];
            rgb[1] += brightness * light.color[1];
            rgb[2] += brightness * light.color[2];
         }
         return rgb;
      },

      /**
       * Calculate brightness for the position based on a set of lights. It is assumed the entity at the position
       * has no normal vector i.e. it is a point in space only.
       * 
       * @param position {vec3}  Position of the source polygon e.g. vertex or average poly point
       * @param lights {Array}   Array of light entities to process
       * @return RGB float component array for final brightness - values added to current values
       */
      calcPositionBrightness: function calcPositionBrightness(position, lights)
      {
         var rgb = [0.0,0.0,0.0];
         for (var e=0, light, brightness; e<lights.length; e++)
         {
            light = lights[e];
            
            if (light instanceof Phoria.DistantLight)
            {
               // Distant lights have no "position"
               brightness = light.intensity;
            }
            else if (light instanceof Phoria.PointLight)
            {
               // Point lights have a position and a fall-off known as attenuation
               var vecToLight = vec3.subtract(vec3.create(), position, light.worldposition),
                   distance = vec3.length(vecToLight),
                   attenuation;
               vec3.normalize(vecToLight, vecToLight);
               
               switch (light.attenuationFactor)
               {
                  case "linear":
                     attenuation = light.attenuation * distance;
                     break;
                  case "squared":
                     attenuation = light.attenuation * distance * distance;
                     break;
                  default:
                  case "none":
                     attenuation = light.attenuation;
                     break;
               }
               
               // NOTE: increasing attenuation to try to light wires similar brightness to polygons that
               //       are lit by the same light - other options would be to properly calculate the lighting
               //       normal based on the polygons that share the edges - this would mean more complicated
               //       object descriptions - but provide much more accurate wireframe/point lighting...
               brightness = light.intensity / (attenuation * 2);
            }
            
            // apply each colour component based on light levels (0.0 to 1.0)
            rgb[0] += brightness * light.color[0];
            rgb[1] += brightness * light.color[1];
            rgb[2] += brightness * light.color[2];
         }
         return rgb;
      },

      /**
       * Inflate the vertices of a polygon - see inflatePolygonFull() below for a richer impl - this
       * algorithm is not quite as neat and suffers when the camera lines up exactly with perpendicular
       * edges - however it is much, much faster.
       */
      inflatePolygon: function inflatePolygon(vertices, coords, pixels)
      {
         pixels = pixels || 0.5;
         var inflatedVertices = new Array(vertices.length);
         for (var i=0; i<vertices.length; i++)
         {
            inflatedVertices[i] = [ coords[vertices[i]][0], coords[vertices[i]][1] ];
         }
         for (var i=0, j=vertices.length,k,x1,y1,x2,y2,dx,dy,len; i<j; i++)
         {
            k = (i < j - 1) ? (i+1) : 0;
            x1 = inflatedVertices[i][0];
            y1 = inflatedVertices[i][1];
            x2 = inflatedVertices[k][0];
            y2 = inflatedVertices[k][1];
            var x = x2 - x1, y = y2 - y1,
                det = x * x + y * y, idet;

            if (det === 0) det === Phoria.EPSILON;

            idet = pixels / Math.sqrt(det);

            x *= idet; y *= idet;

            inflatedVertices[i][0] -= x;
            inflatedVertices[i][1] -= y;
            inflatedVertices[k][0] += x;
            inflatedVertices[k][1] += y;
         }
         return inflatedVertices;
      },

      /**
       * Inflate polygon by 0.5 screen pixels to cover cracks generates by the canvas 2D shape fill convention.
       *  see http://stackoverflow.com/questions/3749678/expand-fill-of-convex-polygon
       *  and http://stackoverflow.com/questions/1109536/an-algorithm-for-inflating-deflating-offsetting-buffering-polygons
       * This neat routine means that the gaps between polygons seen in other Canvas based renders are not present. It adds
       * a few percent overhead in CPU processing, but that is much less than the canvas overhead of multiple fill() or other
       * techniques commonly used to hide the polygon cracks. Also the multiple fill or fill then stroke techniques will not
       * work with textured polygons.
       */
      inflatePolygonFull: function inflatePolygonFull(vertices, coords, pixels)
      {
         pixels = pixels || 0.5;
         // generate vertices of parallel edges
         var pedges = [], inflatedVertices = new Array(vertices.length);
         for (var i=0, j=vertices.length, x1,y1,x2,y2,dx,dy,len; i<j; i++)
         {
            // collect an edge
            x1 = coords[vertices[i]][0];
            y1 = coords[vertices[i]][1];
            if (i < j - 1)
            {
               x2 = coords[vertices[i+1]][0];
               y2 = coords[vertices[i+1]][1];
            }
            else
            {
               x2 = coords[vertices[0]][0];
               y2 = coords[vertices[0]][1];
            }
            
            // compute outward facing normal vector - and normalise the length
            dx = y2 - y1;
            dy = -(x2 - x1);
            len = Math.sqrt(dx * dx + dy * dy);
            dx /= len;
            dy /= len;
            
            // multiply by the distance to the parallel edge
            dx *= pixels;
            dy *= pixels;
            
            // generate and store parallel edge
            pedges.push({x: x1 + dx, y: y1 + dy});
            pedges.push({x: x2 + dx, y: y2 + dy});
         }
         
         // calculate intersections to build new screen coords for inflated poly
         for (var i=0, j=vertices.length, vec; i<j; i++)
         {
            if (i === 0)
            {
               vec = this.intersection(pedges[(j-1) * 2], pedges[(j-1) * 2 + 1], pedges[0], pedges[1]);
            }
            else
            {
               vec = this.intersection(pedges[(i-1) * 2], pedges[(i-1) * 2 + 1], pedges[i * 2], pedges[i * 2 + 1]);
            }
            // handle edge case (haha) where inflated polygon vertex edges jump towards infinity
            if (Math.abs(vec[0] - coords[vertices[i]][0]) > 1.5 || Math.abs(vec[1] - coords[vertices[i]][1]) > 1.5)
            {
               // reset to original coordinates
               vec[0] = coords[vertices[i]][0];
               vec[1] = coords[vertices[i]][1];
            }
            inflatedVertices[i] = vec;
         }
         
         return inflatedVertices;
      },
      
      intersection: function intersection(line0v0, line0v1, line1v0, line1v1)
      {
         var a1 = line0v1.x - line0v0.x,
             b1 = line1v0.x - line1v1.x,
             c1 = line1v0.x - line0v0.x,
             a2 = line0v1.y - line0v0.y,
             b2 = line1v0.y - line1v1.y,
             c2 = line1v0.y - line0v0.y,
             t = (b1*c2 - b2*c1) / (a2*b1 - a1*b2);
         
         return [
            line0v0.x + t * (line0v1.x - line0v0.x),
            line0v0.y + t * (line0v1.y - line0v0.y)
         ];
      }
   };
})();


(function() {
   "use strict";

   /**
    * CanvasRenderer will output the scene onto the supplied canvas context using the 2D drawing context. Standard canvas
    * 2D operations such as drawing arcs, lines and filled shapes will be used to render the 3D entities. A lot of the rendering
    * techniques are based on the work done in my first JavaScript 3D library 'K3D' see bit.ly/canvask3d
    */
   Phoria.CanvasRenderer = function(canvas)
   {
      Phoria.CanvasRenderer.superclass.constructor.call(this);

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');

      return this;
   };
   
   Phoria.Util.extend(Phoria.CanvasRenderer, Phoria.Renderer, {
      // {Object} canvas to use as the output context
      canvas: null,
      
      ctx: null,
      
      /**
       * Render the given scene to the canvas context
       * 
       * @param {Phoria.Scene} scene   The scene to render - processed by scene.modelView()
       * @param {function} fnClear     Optional canvas clearing strategy function - otherwise clearRect() is used
       */
      render: function render(scene, fnClear)
      {
         this.sortObjects(scene);
         
         // clear the canvas before rendering begins - optional clearing function can be supplied
         var ctx = this.ctx;
         if (!fnClear)
         {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
         }
         else
         {
            fnClear.call(this, ctx);
         }
         
         // scene performs all local, world and projection calculations and flattens the rendering list ready for rendering.
         for (var n=0, obj; n<scene.renderlist.length; n++)
         {
            obj = scene.renderlist[n];

            ctx.save();
            if (obj.style.compositeOperation)
            {
               ctx.globalCompositeOperation = obj.style.compositeOperation;
            }
            switch (obj.style.drawmode)
            {
               case "solid":
               {
                  // ensure line width is set if appropriate fillmode is being used
                  if (obj.style.fillmode === "fillstroke" || obj.style.fillmode === "hiddenline") ctx.lineWidth = 1.0;
                  
                  // render the pre-sorted polygons
                  for (var i=0; i<obj.polygons.length; i++)
                  {
                     this.renderPolygon(ctx, obj, scene, obj.polygons[i]);
                  }
                  break;
               }
               
               case "wireframe":
               {
                  ctx.lineWidth = obj.style.linewidth;
                  ctx.globalAlpha = obj.style.opacity;
                  if (obj.style.shademode === "plain")
                  {
                     ctx.strokeStyle = "rgb(" + obj.style.color[0] + "," + obj.style.color[1] + "," + obj.style.color[2] + ")";
                     ctx.beginPath();
                     for (var i=0; i<obj.edges.length; i++)
                     {
                        this.renderEdge(ctx, obj, scene, obj.edges[i]);
                     }
                     ctx.closePath();
                     ctx.stroke();
                  }
                  else
                  {
                     for (var i=0; i<obj.edges.length; i++)
                     {
                        this.renderEdge(ctx, obj, scene, obj.edges[i]);
                     }
                  }
                  break;
               }
               
               case "point":
               {
                  // assert to ensure that the texture image referenced by the 'sprite' index exists
                  if (obj.style.shademode === "sprite" && obj.style.sprite !== undefined)
                  {
                     if (!obj.textures)
                     {
                        throw new Error("Entity has shademode 'sprite' but no textures defined on parent emitter.");
                     }
                     if (obj.style.sprite > obj.textures.length - 1)
                     {
                        throw new Error("Entity has shademode 'sprite' index but references missing texture on parent emitter.")
                     }
                  }
                  ctx.globalAlpha = obj.style.opacity;
                  var coords = obj._coords;
                  if (obj.style.shademode === "plain")
                  {
                     ctx.fillStyle = "rgb(" + obj.style.color[0] + "," + obj.style.color[1] + "," + obj.style.color[2] + ")";
                  }
                  for (var i=0; i<coords.length; i++)
                  {
                     this.renderPoint(ctx, obj, scene, coords[i], i);
                  }
               }
            }
            ctx.restore();
         }
      },

      renderPoint: function renderPoint(ctx, obj, scene, coord, index)
      {
         // perform clip of point if vertex has been marked for clipping
         if (obj._clip[index]) return;
         
         var w = obj.style.linewidth;
         if (obj.style.linescale !== 0)
         {
            // use the perspective divisor to calculate line width scaling
            // try to keep this calculation in sync with scene point clipOffset calculation
            w = (obj.style.linewidth * obj.style.linescale * scene._perspectiveScale) / obj._coords[index][3];
         }

         switch (obj.style.shademode)
         {
            case "plain":
            {
               ctx.beginPath();
               ctx.arc(coord[0], coord[1], w, 0, Phoria.TWOPI, true);
               ctx.closePath();
               ctx.fill();
               break;
            }
            case "sprite":
            {
               if (obj.style.sprite !== undefined)
               {
                  ctx.drawImage(obj.textures[obj.style.sprite], coord[0]-w, coord[1]-w, w+w, w+w);
               }
               break;
            }
            case "callback":
            {
               // optional rendering callback functions
               if (obj.onRenderHandlers !== null)
               {
                  for (var h=0; h<obj.onRenderHandlers.length; h++)
                  {
                     obj.onRenderHandlers[h].call(obj, ctx, coord[0], coord[1], w);
                  }
               }
               break;
            }
            case "lightsource":
            {
               // lighting calc
               var rgb = this.calcPositionBrightness(obj._worldcoords[index], scene.lights);
               ctx.fillStyle = "rgb(" + Math.min(Math.ceil(rgb[0] * obj.style.color[0]),255) + "," +
                                        Math.min(Math.ceil(rgb[1] * obj.style.color[1]),255) + "," +
                                        Math.min(Math.ceil(rgb[2] * obj.style.color[2]),255) + ")";
               ctx.beginPath();
               ctx.arc(coord[0], coord[1], w, 0, Phoria.TWOPI, true);
               ctx.closePath();
               ctx.fill();
               break;
            }
         }
      },
      
      renderEdge: function renderEdge(ctx, obj, scene, edge)
      {
         // perform clip of edge if all vertices have been marked for clipping
         if (obj._clip[edge.a] & obj._clip[edge.b]) return;
         
         var coords = obj._coords;
         
         if (obj.style.linescale !== 0)
         {
            // use the perspective divisor to calculate line width scaling
            ctx.lineWidth = ((obj.style.linewidth * obj.style.linescale) / ((obj._coords[edge.a][3] + obj._coords[edge.b][3]) * 0.5)) * scene._perspectiveScale;
         }

         // lighting calc
         if (obj.style.shademode === "lightsource")
         {
            var edgea = obj._worldcoords[edge.a], edgeb = obj._worldcoords[edge.b],
                position = vec3.fromValues((edgea[0] + edgeb[0]) * 0.5, (edgea[1] + edgeb[1]) * 0.5, (edgea[2] + edgeb[2]) * 0.5);
            var rgb = this.calcPositionBrightness(position, scene.lights);
            ctx.beginPath();
            ctx.strokeStyle = "rgb(" + Math.min(Math.ceil(rgb[0] * obj.style.color[0]),255) + "," +
                                       Math.min(Math.ceil(rgb[1] * obj.style.color[1]),255) + "," +
                                       Math.min(Math.ceil(rgb[2] * obj.style.color[2]),255) + ")";
            // draw an edge
            ctx.moveTo(coords[edge.a][0], coords[edge.a][1]);
            ctx.lineTo(coords[edge.b][0], coords[edge.b][1]);
            ctx.closePath();
            ctx.stroke();
         }
         else
         {
            // draw an edge
            ctx.moveTo(coords[edge.a][0], coords[edge.a][1]);
            ctx.lineTo(coords[edge.b][0], coords[edge.b][1]);
         }
      },
      
      renderPolygon: function renderPolygon(ctx, obj, scene, poly)
      {
         var coords = obj._coords,
             clip = obj._clip,
             vertices = poly.vertices,
             color = poly.color ? poly.color : obj.style.color,
             fillStyle = null, rgb, emit = 0.0, opacity = (poly.opacity ? poly.opacity : obj.style.opacity);
         
         // clip of poly if all vertices have been marked for clipping
         var clippoly = 1;
         for (var i=0; i<vertices.length; i++)
         {
            clippoly &= clip[vertices[i]];
         }
         if (clippoly) return;
         
         // hidden surface removal - use area sign in screen space calculation rather than normal to camera
         // as normal dot test will only work for orthogonal projection not perspective projection
         if (!obj.style.doublesided && 
             ((coords[vertices[0]][0]*coords[vertices[1]][1] - coords[vertices[1]][0]*coords[vertices[0]][1]) +
              (coords[vertices[1]][0]*coords[vertices[2]][1] - coords[vertices[2]][0]*coords[vertices[1]][1]) +
              (coords[vertices[2]][0]*coords[vertices[0]][1] - coords[vertices[0]][0]*coords[vertices[2]][1]) < 0)) return;
         
         // generate fill style based on lighting mode
         switch (obj.style.shademode)
         {
            case "plain":
            {
               if (obj.style.texture === undefined && poly.texture === undefined)
               {
                  fillStyle = color[0] + "," + color[1] + "," + color[2];
               }
               
               break;
            }
            
            case "lightsource":
            {
               // this performs a pass for each light - a simple linear-additive lighting model
               rgb = this.calcNormalBrightness(Phoria.Util.averagePolyVertex(vertices, obj._worldcoords), poly._worldnormal, scene, obj);
               
               if (poly.emit || obj.style.emit)
               {
                  emit = poly.emit ? poly.emit : obj.style.emit;
               }

               // generate style string for canvas fill (integers in 0-255 range)
               fillStyle = Math.min(Math.ceil(rgb[0]*color[0] + color[0]*emit),255) + "," +
                           Math.min(Math.ceil(rgb[1]*color[1] + color[1]*emit),255) + "," +
                           Math.min(Math.ceil(rgb[2]*color[2] + color[1]*emit),255);
               
               break;
            }
         }
         
         // render the polygon - textured or one of the solid fill modes
         ctx.save();
         if (obj.style.texture !== undefined || poly.texture !== undefined)
         {
            var bitmap = obj.textures[ poly.texture !== undefined ? poly.texture : obj.style.texture ],
                tx0, ty0, tx1, ty1, tx2, ty2;
            var fRenderTriangle = function(vs, sx0, sy0, sx1, sy1, sx2, sy2)
            {
               var x0 = vs[0][0], y0 = vs[0][1],
                   x1 = vs[1][0], y1 = vs[1][1],
                   x2 = vs[2][0], y2 = vs[2][1];
               ctx.beginPath();
               ctx.moveTo(x0, y0);
               ctx.lineTo(x1, y1);
               ctx.lineTo(x2, y2);
               ctx.closePath();
               ctx.clip();
               
               // Textured triangle transformation code originally by Thatcher Ulrich
               // TODO: figure out if drawImage goes faster if we specify the rectangle that bounds the source coords.
               // TODO: this is far from perfect - due to perspective corrected texture mapping issues see:
               //       http://tulrich.com/geekstuff/canvas/perspective.html
               
               // collapse terms
               var denom = denom = 1.0 / (sx0 * (sy2 - sy1) - sx1 * sy2 + sx2 * sy1 + (sx1 - sx2) * sy0);
               // calculate context transformation matrix
               var m11 = - (sy0 * (x2 - x1) - sy1 * x2 + sy2 * x1 + (sy1 - sy2) * x0) * denom,
                   m12 = (sy1 * y2 + sy0 * (y1 - y2) - sy2 * y1 + (sy2 - sy1) * y0) * denom,
                   m21 = (sx0 * (x2 - x1) - sx1 * x2 + sx2 * x1 + (sx1 - sx2) * x0) * denom,
                   m22 = - (sx1 * y2 + sx0 * (y1 - y2) - sx2 * y1 + (sx2 - sx1) * y0) * denom,
                   dx = (sx0 * (sy2 * x1 - sy1 * x2) + sy0 * (sx1 * x2 - sx2 * x1) + (sx2 * sy1 - sx1 * sy2) * x0) * denom,
                   dy = (sx0 * (sy2 * y1 - sy1 * y2) + sy0 * (sx1 * y2 - sx2 * y1) + (sx2 * sy1 - sx1 * sy2) * y0) * denom;
               
               ctx.transform(m11, m12, m21, m22, dx, dy);
               
               // Draw the whole texture image. Transform and clip will map it onto the correct output polygon.
               ctx.globalAlpha = opacity;
               ctx.drawImage(bitmap, 0, 0);
            };
            
            if (fillStyle !== null)
            {
               // convert RGB to grey scale level
               var alpha = rgb[0]*0.3 + rgb[1]*0.6 + rgb[2]*0.1;
               if (alpha > 1.0) alpha = 1.0;
               // fix to N decimal places to avoid eExp notation on toString()!
               ctx.fillStyle = "rgba(" + fillStyle + "," + (1.0 - alpha).toFixed(3) + ")";
            }
            
            // we can only deal with triangles for texturing - a quad must be split into two triangles
            // TODO: needs a triangle subdivision algorithm for > 4 verticies
            if (vertices.length === 3)
            {
               tx0 = 0, ty0 = 0, tx1 = bitmap.width, ty1 = 0, tx2 = bitmap.width, ty2 = bitmap.height;
               if (poly.uvs !== undefined)
               {
                  tx0 = bitmap.width * poly.uvs[0]; ty0 = bitmap.height * poly.uvs[1];
                  tx1 = bitmap.width * poly.uvs[2]; ty1 = bitmap.height * poly.uvs[3];
                  tx2 = bitmap.width * poly.uvs[4]; ty2 = bitmap.height * poly.uvs[5];
               }
               // TODO: Chrome does not need the texture poly inflated!
               var inflatedVertices = this.inflatePolygon(vertices, coords, 0.5);
               fRenderTriangle.call(this, inflatedVertices, tx0, ty0, tx1, ty1, tx2, ty2);
               // apply optional color fill to shade and light the texture image
               if (fillStyle !== null)
               {
                  ctx.fill();
               }
            }
            else if (vertices.length === 4)
            {
               tx0 = 0, ty0 = 0, tx1 = bitmap.width, ty1 = 0, tx2 = bitmap.width, ty2 = bitmap.height;
               if (poly.uvs !== undefined)
               {
                  tx0 = bitmap.width * poly.uvs[0]; ty0 = bitmap.height * poly.uvs[1];
                  tx1 = bitmap.width * poly.uvs[2]; ty1 = bitmap.height * poly.uvs[3];
                  tx2 = bitmap.width * poly.uvs[4]; ty2 = bitmap.height * poly.uvs[5];
               }
               ctx.save();
               // TODO: Chrome does not need the texture poly inflated!
               var inflatedVertices = this.inflatePolygon(vertices.slice(0, 3), coords, 0.5);
               fRenderTriangle.call(this, inflatedVertices, tx0, ty0, tx1, ty1, tx2, ty2);
               ctx.restore();

               tx0 = bitmap.width, ty0 = bitmap.height, tx1 = 0, ty1 = bitmap.height, tx2 = 0, ty2 = 0;
               if (poly.uvs !== undefined)
               {
                  tx0 = bitmap.width * poly.uvs[4]; ty0 = bitmap.height * poly.uvs[5];
                  tx1 = bitmap.width * poly.uvs[6]; ty1 = bitmap.height * poly.uvs[7];
                  tx2 = bitmap.width * poly.uvs[0]; ty2 = bitmap.height * poly.uvs[1];
               }
               ctx.save();
               var v = new Array(3);
               v[0] = vertices[2];
               v[1] = vertices[3];
               v[2] = vertices[0];
               // TODO: Chrome does not need the texture poly inflated!
               inflatedVertices = this.inflatePolygon(v, coords, 0.5);
               fRenderTriangle.call(this, inflatedVertices, tx0, ty0, tx1, ty1, tx2, ty2);
               ctx.restore();

               // apply optional color fill to shade and light the texture image
               if (fillStyle !== null)
               {
                  // TODO: better to inflate again or fill two tris as above?
                  inflatedVertices = this.inflatePolygon(vertices, coords, 0.75);
                  ctx.beginPath();
                  ctx.moveTo(inflatedVertices[0][0], inflatedVertices[0][1]);
                  for (var i=1, j=inflatedVertices.length; i<j; i++)
                  {
                     ctx.lineTo(inflatedVertices[i][0], inflatedVertices[i][1]);
                  }
                  ctx.closePath();
                  ctx.globalAlpha = opacity;
                  ctx.fill();
               }
            }
         }
         else
         {
            // solid colour fill
            if (obj.style.fillmode === "inflate")
            {
               // inflate the polygon screen coords to cover the 0.5 pixel cracks between canvas fill()ed polygons
               var inflatedVertices = this.inflatePolygon(vertices, coords, 0.5);
               ctx.beginPath();
               ctx.moveTo(inflatedVertices[0][0], inflatedVertices[0][1]);
               for (var i=1, j=vertices.length; i<j; i++)
               {
                  ctx.lineTo(inflatedVertices[i][0], inflatedVertices[i][1]);
               }
               ctx.closePath();
            }
            else
            {
               ctx.beginPath();
               // move to first point in the polygon
               ctx.moveTo(coords[vertices[0]][0], coords[vertices[0]][1]);
               for (var i=1; i<vertices.length; i++)
               {
                  // move to each additional point
                  ctx.lineTo(coords[vertices[i]][0], coords[vertices[i]][1]);
               }
               // no need to plot back to first point - as path closes shape automatically
               ctx.closePath();
            }
            
            fillStyle = "rgba(" + fillStyle + "," + opacity + ")";
            switch (obj.style.fillmode)
            {
               case "fill":
                  // single fill - fastest but leaves edge lines
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  break;
               
               case "filltwice":
                  // double fill causes "overdraw" towards edges - slightly slower
                  // but removes enough of the cracks for dense objects and small faces
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  ctx.fill();
                  break;
               
               case "inflate":
                  // inflate (also called 'buffering') the polygon in 2D by a small ammount
                  // and then a single fill can be used - increase in pre calculation time
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  break;
               
               case "fillstroke":
                  // single fill - followed by a stroke line - nicer edge fill but slower
                  ctx.fillStyle = fillStyle;
                  ctx.fill();
                  ctx.strokeStyle = fillStyle;
                  ctx.stroke();
                  break;
               
               case "hiddenline":
                  // stroke only - to produce hidden line wire effect
                  ctx.strokeStyle = fillStyle;
                  ctx.stroke();
                  break;
            }
         }
         ctx.restore();
      }
   });
})();


(function() {
   "use strict";

   /**
    * Software renderer is based on the work by mr.doob which in turn is based on the work here:
    * http://devmaster.net/forums/topic/1145-advanced-rasterization/
    * For lots of small polygons in a very fast JavaScript VM (V8 on Chrome) then it can be faster than
    * standard canvas poly drawing - but does not have anti-aliasing and is notably slower for large polygons.
    */
   Phoria.SoftwareRenderer = function(canvas)
   {
      Phoria.SoftwareRenderer.superclass.constructor.call(this);

      this.canvas = canvas;
      this.ctx = canvas.getContext('2d');
      this._imagedata = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
      this._data = this._imagedata.data;

      return this;
   };
   
   Phoria.Util.extend(Phoria.SoftwareRenderer, Phoria.Renderer, {
      // canvas to use as the output context
      canvas: null,
      ctx: null,
      _imagedata: null,
      _data: null,
      
      /**
       * Render the given scene to the canvas context
       * 
       * @param {Phoria.Scene} scene   The scene to render - processed by scene.modelView()
       */
      render: function render(scene)
      {
         this.sortObjects(scene);
         
         // clear the canvas before rendering begins
         // TODO: optimize with prevrect - see SoftwareRenderer
         this.clearCanvasRect(0, 0, this.canvas.width, this.canvas.height);
         //this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
         //this._imagedata = this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
         //this._data = this._imagedata.data;

         // scene performs all local, world and projection calculations and flattens the rendering list ready for rendering.
         for (var n=0, obj; n<scene.renderlist.length; n++)
         {
            obj = scene.renderlist[n];
            
            switch (obj.style.drawmode)
            {
               case "solid":
               {
                  // render the pre-sorted polygons
                  var rendercount = 0;
                  for (var i=0; i<obj.polygons.length; i++)
                  {
                     if (this.renderPolygon(null, obj, scene, obj.polygons[i])) rendercount++;
                  }
                  //if (Date.now() % 25 === 0) console.log(rendercount);
                  break;
               }
            }
         }

         // TODO: optimize with prev rect - see SoftwareRenderer
         this.ctx.putImageData(this._imagedata, 0, 0, 0, 0, this.canvas.width, this.canvas.height);
      },

      clearCanvasRect: function clearCanvasRect(xmin, ymin, xmax, ymax)
      {
         // TODO: optimize with prevrect - see SoftwareRenderer
         var offset = (xmin + ymin * this.canvas.width - 1) * 4 + 3,
             linestep = (this.canvas.width - (xmax - xmin)) * 4,
             data = this._data;
         for (var y = ymin; y < ymax; y++)
         {
            for (var x = xmin; x < xmax; x++)
            {
               data[offset += 4] = 0;
            }
            offset += linestep;
         }
      },
      
      renderPolygon: function renderPolygon(ctx, obj, scene, poly)
      {
         var coords = obj._coords,
             clip = obj._clip,
             vertices = poly.vertices,
             color = poly.color ? poly.color : obj.style.color;

         // clip of poly if all vertices have been marked for clipping
         var clippoly = 1;
         for (var i=0; i<vertices.length; i++)
         {
            clippoly &= clip[vertices[i]];
         }
         if (clippoly) return false;
         
         // hidden surface removal
         if (!obj.style.doublesided && 
             ((coords[vertices[0]][0]*coords[vertices[1]][1] - coords[vertices[1]][0]*coords[vertices[0]][1]) +
              (coords[vertices[1]][0]*coords[vertices[2]][1] - coords[vertices[2]][0]*coords[vertices[1]][1]) +
              (coords[vertices[2]][0]*coords[vertices[0]][1] - coords[vertices[0]][0]*coords[vertices[2]][1]) < 0)) return;
         
         // generate fill style based on lighting mode
         var rgb;
         switch (obj.style.shademode)
         {
            case "plain":
            {
               rgb = new Array(3);
               rgb[0] = color[0];
               rgb[1] = color[1];
               rgb[2] = color[2];

               break;
            }
            
            case "lightsource":
            {
               // perform a pass for each light - a simple linear-additive lighting model
               rgb = this.calcNormalBrightness(Phoria.Util.averagePolyVertex(vertices, obj._worldcoords), poly._worldnormal, scene, obj);

               // generate final RGB
               rgb[0] = Math.ceil(Math.min(rgb[0]*color[0], 255));
               rgb[1] = Math.ceil(Math.min(rgb[1]*color[1], 255));
               rgb[2] = Math.ceil(Math.min(rgb[2]*color[2], 255));
               
               break;
            }
         }
         
         // render a triangle in software to a buffer
         this.drawTriangle(
            coords[vertices[2]][0], coords[vertices[2]][1],
            coords[vertices[1]][0], coords[vertices[1]][1],
            coords[vertices[0]][0], coords[vertices[0]][1],
            rgb[0], rgb[1], rgb[2]);
         // handle quad - split into second triangle
         // TODO: polygon subvision is needed for >4 verts if this renderer is used...
         if (vertices.length === 4)
         {
            this.drawTriangle(
               coords[vertices[0]][0], coords[vertices[0]][1],
               coords[vertices[3]][0], coords[vertices[3]][1],
               coords[vertices[2]][0], coords[vertices[2]][1],
               rgb[0], rgb[1], rgb[2]);
         }
         return true;
      },

      drawTriangle: function drawTriangle(x1, y1, x2, y2, x3, y3, r, g, b)
      {
         // http://devmaster.net/forums/topic/1145-advanced-rasterization/

         // 28.4 fixed-point coordinates
         var x1 = Math.round( 16 * x1 ),
             x2 = Math.round( 16 * x2 ),
             x3 = Math.round( 16 * x3 ),
             y1 = Math.round( 16 * y1 ),
             y2 = Math.round( 16 * y2 ),
             y3 = Math.round( 16 * y3 );

         // Deltas
         var dx12 = x1 - x2,
             dx23 = x2 - x3,
             dx31 = x3 - x1,
             dy12 = y1 - y2,
             dy23 = y2 - y3,
             dy31 = y3 - y1;

         // Fixed-point deltas
         var fdx12 = dx12 << 4,
             fdx23 = dx23 << 4,
             fdx31 = dx31 << 4,
             fdy12 = dy12 << 4,
             fdy23 = dy23 << 4,
             fdy31 = dy31 << 4;

         var canvasWidth = this.canvas.width,
             canvasHeight = this.canvas.height,
             data = this._data;

         // Bounding rectangle
         var xmin = Math.max( ( Math.min( x1, x2, x3 ) + 0xf ) >> 4, 0 ),
             xmax = Math.min( ( Math.max( x1, x2, x3 ) + 0xf ) >> 4, canvasWidth ),
             ymin = Math.max( ( Math.min( y1, y2, y3 ) + 0xf ) >> 4, 0 ),
             ymax = Math.min( ( Math.max( y1, y2, y3 ) + 0xf ) >> 4, canvasHeight );
         
         if (xmax <= xmin || ymax <= ymin) return;

         //rectx1 = Math.min( xmin, rectx1 );
         //rectx2 = Math.max( xmax, rectx2 );
         //recty1 = Math.min( ymin, recty1 );
         //recty2 = Math.max( ymax, recty2 );

         // Constant part of half-edge functions
         var c1 = dy12 * x1 - dx12 * y1,
             c2 = dy23 * x2 - dx23 * y2,
             c3 = dy31 * x3 - dx31 * y3;

         // Correct for fill convention
         if ( dy12 < 0 || ( dy12 == 0 && dx12 > 0 ) ) c1++;
         if ( dy23 < 0 || ( dy23 == 0 && dx23 > 0 ) ) c2++;
         if ( dy31 < 0 || ( dy31 == 0 && dx31 > 0 ) ) c3++;

         var cy1 = c1 + dx12 * ( ymin << 4 ) - dy12 * ( xmin << 4 ),
             cy2 = c2 + dx23 * ( ymin << 4 ) - dy23 * ( xmin << 4 ),
             cy3 = c3 + dx31 * ( ymin << 4 ) - dy31 * ( xmin << 4 ),
             cx1, cx2, cx3;

         // Scan through bounding rectangle
         for (var y = ymin,x,offset; y < ymax; y++)
         {
            // Start value for horizontal scan
            cx1 = cy1;
            cx2 = cy2;
            cx3 = cy3;
            for (x = xmin; x < xmax; x++)
            {
               if (cx1 > 0 && cx2 > 0 && cx3 > 0)
               {
                  offset = (x + y * canvasWidth) << 2;
                  data[ offset ] = r;
                  data[ offset + 1 ] = g;
                  data[ offset + 2 ] = b;
                  data[ offset + 3 ] = 255;
               }
               cx1 -= fdy12;
               cx2 -= fdy23;
               cx3 -= fdy31;
            }
            cy1 += fdx12;
            cy2 += fdx23;
            cy3 += fdx31;
         }
      }
   });
})();
/**
 * @fileoverview phoria - Scene controller, manages camera and perspective matrices and scene graph.
 * @author Kevin Roast
 * @date 14th April 2013
 */

(function() {
   "use strict";

   /**
    * Scene encapsulates the meta-data that describes the 3D scene, including the camera, perspective transformation and the
    * viewport size information. It maintains the scene graph of Entity object to process during each scene step. Also provides
    * an event handler 'onCamera' as a hook point for manual modification of the scene data before each rendering cycle.
    * 
    * Typically the scene is setup once via the constructor or factory create helper method below, then an animation function
    * would call the modelView() method during each animation loop. The modelView() function will execute the transformation
    * pipeline applying model view matrix to all entities and preparing a flattened list of objects to be rendered by a renderer.
    * A render such as CanvasRenderer will then be passed the current scene for output: renderer.render(scene) 
    */
   Phoria.Scene = function()
   {
      // set scene defaults
      this.camera = {
         // up vector
         up: {x:0.0, y:1.0, z:0.0},
         // look at location
         lookat: {x:0.0, y:0.0, z:0.0},
         // position of the viewer
         position: {x:0.0, y:0.0, z:-10.0}
      };
      
      this.perspective = {
         // vertical field-of-view in degrees NOTE: converted to Phoria.RADIANS for mat4.perspective()
         fov: 35.0,
         // aspect ratio of the view plane
         aspect: 1.0,
         // near bound of the frustum
         near: 1.0,
         // far bound of the frustum
         far: 10000.0
      };
      
      // typically this is set to the width and height of the canvas rendering area
      this.viewport = {
         x: 0,
         y: 0,
         width: 1024,
         height: 1024
      };
      
      this.graph = [];
      this.triggerHandlers = [];

      return this;
   };

   /**
    * Factory create method - object literal Scene descripton:
    * {
    *    camera: {
    *       up: {x:0.0, y:1.0, z:0.0},
    *       lookat: {x:0.0, y:0.0, z:0.0},
    *       position: {x:0.0, y:0.0, z:-10.0},
    *    },
    *    perspective: {
    *       fov: 35.0,
    *       aspect: 1.0,
    *       near: 1.0,
    *       far: 10000.0
    *    },
    *    viewport: {
    *       x: 0,
    *       y: 0,
    *       width: 1024,
    *       height: 1024
    *    },
    *    graph: [...],
    *    onCamera: function() {...} << or [] of function defs
    */
   Phoria.Scene.create = function(desc)
   {
      // merge object structures to generate scene
      var s = new Phoria.Scene();
      if (desc.camera) s.camera = Phoria.Util.merge(s.camera, desc.camera);
      if (desc.perspective) s.perspective = Phoria.Util.merge(s.perspective, desc.perspective);
      if (desc.viewport) s.viewport = Phoria.Util.merge(s.viewport, desc.viewport);
      if (desc.graph) s.graph = desc.graph;
      if (desc.onCamera) s.onCamera(desc.onCamera);
      
      return s;
   };

   /**
    * Deserialise a scene instance from a JSON structure. All phoria.js scene and child entity objects can be
    * represented as a straight conversion from JSON to JavaScript - the only caveat being event handler function
    * definitions (such as onScene, onCamera, onParticle etc.) are serialised as string values. This helper will
    * walk the resulting entity structure looking for those methods and eval() them into runtime functions.
    * 
    * @param json    JSON string containing a serialised scene description.
    * @return Phoria.Scene
    * @throws Error on failure to parse scene or failure to eval runtime functions
    * 
    * TODO: Unfinished!
    */
   Phoria.Scene.createFromJSON = function(json)
   {
      var scene = null;

      // the object version of the parsed JSON is still just a set of basic JS object literals
      // we need to construct the Phoria objects that represent the scene and entities in the scene graph
      // each entity needs to be processed recursively to ensure all children are constructed also
      var jscene = JSON.parse(json);
      if (jscene)
      {
         // found a scene object
         // firstly, convert any event handler serialised functions to runtime functions

         // now construct Phoria.Scene
         //scene = 
         /*if (jscene.onCamera instanceof string)
         {
            jscene.onCamera = eval(jscene.onCamera)
         }*/
         if (jscene.graph)
         {
            var fnProcessEntities = function(entities) {
               for (var i = 0, e; i < entities.length; i++)
               {
                  e = entities[i];

                  // iterate property names
                  for (var p in e)
                  {
                     if (e.hasOwnProperty(p))
                     {
                        // if property name matches with "on*" it's an event handler (or list of) by convention
                        // TODO: support array of event handler functions in object structure
                        //       the various Phoria Entity objects now support function or array of function passed to on event
                        if (p.indexOf("on") === 0 && (e[p] instanceof string || e[p] instanceof Array))
                        {
                           try
                           {
                              // TODO: convert string to function or array of strings to array of functions
                           }
                           catch (error)
                           {
                              console.log("Failed to convert expected event handler to function: " + p + "=" + e[p]);
                              throw error;
                           }
                        }
                        if (p === "children" && e[p] instanceof Array)
                        {
                           fnProcessEntities(e[p]);
                        }
                     }
                  }

                  // TODO: construct our Phoria entity from the object structure
               }
            };
            fnProcessEntities(jscene.graph);
         }
      }

      return scene;
   };

   /**
    * TODO: Unfinished!
    */
   Phoria.Scene.toJSON = function(scene)
   {
      /*if (scene.onCamera)
      {
         scene.onCamera = scene.onCamera.toString();
      }*/
      for (var p in scene)
      {
         if (scene.hasOwnProperty(p) && p.indexOf("_") === 0)
         {
            // remove private property/function before serialisation
            delete scene[p];
         }
      }
      if (scene.graph)
      {
         var fnProcessEntities = function(entities) {
            for (var i = 0, e; i < entities.length; i++)
            {
               e = entities[i];
               // iterate property names
               for (var p in e)
               {
                  if (e.hasOwnProperty(p))
                  {
                     // if property name matches "on*Handlers" it is an event handler function list by convention
                     if (p.indexOf("on") === 0 && e[p] instanceof Array)
                     {
                        e[p] = e[p].toString();
                     }

                     // TODO: modify all Phoria entity classes to correctly mark private vars with "_"

                     if (p.indexOf("_") === 0)
                     {
                        // remove private property/function before serialisation
                        delete e[p];
                     }
                     switch (p)
                     {
                        case "textures":
                           delete e[p];
                           break;
                        
                        case "children":
                           if (e[p] instanceof Array)
                           {
                              fnProcessEntities(e[p]);
                           }
                           break;
                     }
                  }
               }

               // TODO: need to serialise the Entity type into the object structure!
            }
         };
         fnProcessEntities(scene.graph);
      }

      return JSON.stringify(scene);
   };
   
   Phoria.Scene.prototype = {
      // {Object} camera - converts values to vec3 to generate camera matrix
      camera: null,
      
      // {Object} the near/far values are distances from the camera view plane, and are always positive.
      // the perspective frustrum moves with the viewer
      perspective: null,
      
      // {Array} manipulate 3D entity graph directly e.g. push/delete objects
      graph: null,

      // {Object} dimensions of viewport for NDC->viewport conversion step
      viewport: null,

      // @readonly {Array} the flattened, sorted list of entities for rendering a frame of the scene - set by modelView()
      renderlist: null,

      // @readonly {Array} the light entities that were found when processing the scene graph - set by modelView()
      lights: null,
      
      // {Array} list of objects containing a "trigger" function that is executed once per frame.
      // Each trigger can affect the scene at runtime and if needed expire the event handler from the active list
      // or add new trigger(s) with additional logic to continue a sequence of triggers and events.
      triggerHandlers: null,
      
      // @private {Array} list of onCamera event handler functions to be called on each frame - added via "onCamera()"
      onCameraHandlers: null,

      // @private {Object} map of entity IDs to Phoria.Entity instances - flattened lookup list used by trigger handlers
      // to lookup an entity without walking child lists or maintaining closure scope etc. Call findEntity() to use.
      _entities: null,

      _lastTime: 0,
      _cameraPosition: null,        // current camera position as vec4
      _perspectiveScale: 0.0,

      /**
       * Helper to lookup an entity by it's optional ID. Useful for Trigger event handlers that don't
       * want to walk complex trees of entities during event handler functions.
       * 
       * @param id {string}      ID of the entity to lookup
       * @return Phoria.Entity or null if not found
       */
      findEntity: function findEntity(id)
      {
         return this._entities[id];
      },

      /**
       * Add an onCamera event handler function to the entity
       * 
       * @param fn {function}    onCamera handler signature: function(position, lookAt, up) this = scene,
       *                         accepts [] of functions also
       */
      onCamera: function onCamera(fn)
      {
         if (this.onCameraHandlers === null) this.onCameraHandlers = [];
         this.onCameraHandlers = this.onCameraHandlers.concat(fn);
      },
      
      /**
       * Execute the transformation pipeline for applying model view matrix to all entities
       * 
       * This method is responsible for:
       * . Setting up Camera and Perspective matrices based on the scene description
       * . Applying local transformations - with respect to parent child relationships to each entity in the scene
       * . Applying the camera and perspective transformation matrices to each entity
       * . Sort entity points/edges/polygons by Z order
       * . Perspective division to create Normalised Device Coordinates then finally transform to viewport
       * . Clipping calculations occurs before the viewport transform to mark vertices as "clipped" for rendering
       * . Lighting transformations for polygon normal vectors
       */
      modelView: function modelView()
      {
         // time since last update in seconds
         var now = Date.now(),
             time = (now - this._lastTime) / 1000;
         this._lastTime = now;
         
         // prerender steps that are performed on each frame before objects are processed - setup matrices etc.
         
         // viewport size and offset details
         var vpx = this.viewport.x,
             vpy = this.viewport.y,
             vpw = this.viewport.width * 0.5,
             vph = this.viewport.height * 0.5;
         
         // store current camera position as vec4 - useful for specular lighting calculations later
         this._cameraPosition = vec4.fromValues(
            this.camera.position.x,
            this.camera.position.y,
            this.camera.position.z,
            0);
         var camera = mat4.create(),
             cameraLookat = vec4.fromValues(
               this.camera.lookat.x,
               this.camera.lookat.y,
               this.camera.lookat.z,
               0),
             cameraUp = vec4.fromValues(
               this.camera.up.x,
               this.camera.up.y,
               this.camera.up.z,
               0);
         
         // hook point to allow processing of the camera vectors before they are applied to the lookAt matrix
         // e.g. rotate the camera position around an axis
         // another way to do this would be to perform this step manually at the start of an animation loop
         if (this.onCameraHandlers !== null)
         {
            for (var h=0; h<this.onCameraHandlers.length; h++)
            {
               this.onCameraHandlers[h].call(this, this._cameraPosition, cameraLookat, cameraUp);
            }
         }

         // generate the lookAt matrix
         mat4.lookAt(
            camera,
            this._cameraPosition,
            cameraLookat,
            cameraUp);
         
         // calculate perspective matrix for our scene
         var perspective = mat4.create();
         mat4.perspective(
            perspective,
            -this.perspective.fov * Phoria.RADIANS,
            this.perspective.aspect,
            this.perspective.near,
            this.perspective.far);
         // scaling factor used when rendering points to account for perspective fov
         this._perspectiveScale = (256 - this.perspective.fov) / 16;
         
         // process each object in the scene graph
         // and recursively process each child entity (against parent local matrix)
         var renderlist = [],
             lights = [],
             entityById = {};
         
         // recursive processing function - keeps track of current matrix operation
         var fnProcessEntities = function processEntities(entities, matParent)
         {
            for (var n=0, obj, len, isIdentity; n<entities.length; n++)
            {
               obj = entities[n];

               // check disabled flag for this entity
               if (obj.disabled) continue;

               // construct entity lookup list by optional ID
               // used to quickly lookup entities in event handlers without walking child lists etc.
               if (obj.id) entityById[obj.id] = obj;
               
               // hook point for onBeforeScene event handlers - custom user handlers or added by entities during
               // object construction - there can be multiple registered per entity
               if (obj.onBeforeSceneHandlers !== null)
               {
                  for (var h=0; h<obj.onBeforeSceneHandlers.length; h++)
                  {
                     obj.onBeforeSceneHandlers[h].call(obj, this, time);
                  }
               }

               // multiply local with parent matrix to combine affine transformations
               var matLocal = obj.matrix;
               if (matParent)
               {
                  // if parent matrix is provided multiply it against local matrix else use the parent matrix
                  matLocal = matLocal ? mat4.multiply(mat4.create(), matLocal, matParent) : matParent;
               }
               
               // hook point for onScene event handlers - custom user handlers or added by entities during
               // object construction - there can be multiple registered per entity
               if (obj.onSceneHandlers !== null)
               {
                  for (var h=0; h<obj.onSceneHandlers.length; h++)
                  {
                     obj.onSceneHandlers[h].call(obj, this, matLocal, time);
                  }
               }
               
               if (obj instanceof Phoria.BaseLight)
               {
                  lights.push(obj);
               }
               else if (obj instanceof Phoria.Entity)
               {
                  len = obj.points.length;
                  
                  // pre-create or reuse coordinate buffers for world, screen, normal and clip coordinates
                  obj.initCoordinateBuffers();
                  
                  // set-up some values used during clipping calculations
                  var objClip = 0,
                      clipOffset = 0;
                  if (obj.style.drawmode === "point")
                  {
                     // adjust vec by style linewidth calculation for linewidth scaled points or sprite points
                     // this allows large sprite/rendered points to avoid being clipped too early
                     if (obj.style.linescale === 0)
                     {
                        clipOffset = obj.style.linewidth * 0.5;
                     }
                     else
                     {
                        clipOffset = (obj.style.linewidth * obj.style.linescale) / this._perspectiveScale * 0.5;
                     }
                  }
                  
                  // main vertex processing loop
                  for (var v=0, verts, vec, w, avz=0; v<len; v++)
                  {
                     // construct homogeneous coordinate for the vertex as a vec4
                     verts = obj.points[v];
                     vec = vec4.set(obj._worldcoords[v], verts.x, verts.y, verts.z, 1.0);
                     
                     // local object transformation -> world space
                     // skip local transform if matrix not present
                     // else store locally transformed vec4 world points
                     if (matLocal) vec4.transformMat4(obj._worldcoords[v], vec, matLocal);
                     
                     // multiply by camera matrix to generate camera space coords
                     vec4.transformMat4(obj._cameracoords[v], obj._worldcoords[v], camera);
                     
                     // multiply by perspective matrix to generate perspective and clip coordinates
                     vec4.transformMat4(obj._coords[v], obj._cameracoords[v], perspective);
                     
                     // perspective division to create vec2 NDC then finally transform to viewport
                     // clip calculation occurs before the viewport transform
                     vec = obj._coords[v];
                     w = vec[3];
                     
                     // stop divide by zero
                     if (w === 0) w = Phoria.EPSILON;
                     
                     // is this vertex outside the clipping boundries for the perspective frustum?
                     objClip += (obj._clip[v] = (vec[0] > w+clipOffset || vec[0] < -w-clipOffset ||
                                                 vec[1] > w+clipOffset || vec[1] < -w-clipOffset ||
                                                 vec[2] > w || vec[2] < -w) ? 1 : 0);
                     
                     // perspective division
                     vec[0] /= w;
                     vec[1] /= w;
                     // Z is used by coarse object depth sort
                     
                     // linear transform to viewport - could combine with division above - but for clarity it is not
                     vec[0] = vpw * vec[0] + vpx + vpw;
                     vec[1] = vph * vec[1] + vpy + vph;
                     
                     // keep track of average Z here as it's no overhead and it's useful for rendering
                     avz += vec[2];
                  }
                  // store average Z coordinate
                  obj._averagez = len > 1 ? avz/len : avz;
                  
                  // if entire object is clipped, do not bother with final steps or adding to render list
                  if (objClip !== len)
                  {
                     // sort the geometry before any further transformations
                     switch (obj.style.geometrysortmode)
                     {
                        default:
                        case "automatic":
                        case "sorted":
                        {
                           // solid objects always need sorting as each poly can be a different shade/texture
                           // wireframe and points objects will not be sorted if the "plain" shademode is used
                           if (obj.style.geometrysortmode === "sorted" ||
                               obj.style.drawmode === "solid" || obj.style.shademode === "lightsource")
                           {
                              switch (obj.style.drawmode)
                              {
                                 case "solid":
                                    Phoria.Util.sortPolygons(obj.polygons, obj._cameracoords);
                                    break;
                                 case "wireframe":
                                    Phoria.Util.sortEdges(obj.edges, obj._cameracoords);
                                    break;
                                 case "point":
                                    Phoria.Util.sortPoints(obj._coords, obj._worldcoords);
                                    break;
                              }
                           }
                           break;
                        }
                     }

                     // normal lighting transformation
                     if (obj.style.drawmode === "solid" && obj.polygons.length !== 0)
                     {
                        // TODO: have a flag on scene for "transposedNormalMatrix..." - i.e. make it optional?
                        // invert and transpose the local model matrix - for correct normal scaling
                        var matNormals = mat4.invert(mat4.create(), matLocal ? matLocal : mat4.create());
                        mat4.transpose(matNormals, matNormals);
                        
                        switch (obj.style.shademode)
                        {
                           case "lightsource":
                           {
                              // transform each polygon normal
                              for (var i=0, normal, wnormal; i<obj.polygons.length; i++)
                              {
                                 if (!obj.polygons[i]._worldnormal) obj.polygons[i]._worldnormal = vec4.create();
                                 
                                 // normal transformation -> world space
                                 normal = obj.polygons[i].normal;
                                 wnormal = obj.polygons[i]._worldnormal;
                                 // use vec3 to ensure normal directional component is not modified
                                 vec3.transformMat4(wnormal, normal, matNormals);
                                 vec3.normalize(wnormal, wnormal);
                              }
                              break;
                           }
                           /*
                           case "gouraud":
                           {
                              // transform each vertex normal
                              for (var i=0, normal, wnormal; i<len; i++)
                              {
                                 normal = obj._vertexNormals[i];
                                 wnormal = obj._worldVertexNormals[i];
                                 vec4.transformMat4(wnormal, normal, matNormals);
                                 vec4.normalize(wnormal, wnormal);
                              }
                              break;
                           }
                           */
                        }
                     }
                     
                     // add to the flattened render list
                     renderlist.push(obj);
                  }
               } // end entity processing
               
               // recursively process children
               if (obj.children && obj.children.length !== 0)
               {
                  fnProcessEntities.call(this, obj.children, matLocal);
               }
               
            } // end entity list loop
         };
         fnProcessEntities.call(this, this.graph, null);

         // set the public references to the flattened list of objects to render and the list of lights
         this.renderlist = renderlist;
         this.lights = lights;
         this._entities = entityById;

         // Process the scene trigger functions - this allows for real-time modification of the scene
         // based on a supplied handler function - a sequence of these triggers can nest and add new
         // triggers causing a sequence of events to perform chained actions to the scene as it executes.
         // Uses a for(...) loop to allow add/remove mods to the list during event processing.
         for (var t=0, len = this.triggerHandlers.length; t<len; t++)
         {
            // trigger handlers return true if they are finished i.e. no longer needed in the scene
            if (this.triggerHandlers[t].trigger.call(this, this._cameraPosition, cameraLookat, cameraUp))
            {
               this.triggerHandlers.splice(t, 1);
               len--;
            }
         }
      }
   };
})();
/**
 * @fileoverview phoria - View Control. Helpers to control the view via mouse, provide high-level mouse events.
 * Reverse object selection (entity picking) - contribution from Ruan Moolman.
 * @author Kevin Roast
 * @date 26th Jan 2014
 */

/**
 * View helper class. Provides view related utilities such as high-level event handling. Reverse object selection (entity picking).
 * 
 * @class Phoria.View
 */
(function() {
   "use strict";
   
   Phoria.View = {};
   
   Phoria.View.events = {};
   
   Phoria.View.addMouseEvents = function addMouseEvents(el, fnOnClick)
   {
      if (el.id)
      {
         // mouse rotation and position tracking instance
         var mouse = {
            velocityH: 0,        // final target value from horizontal mouse movement 
            velocityLastH: 0,
            positionX: 0,
            clickPositionX: 0,   // last mouse click position
            velocityV: 0,        // final target value from vertical mouse movement 
            velocityLastV: 0,
            positionY: 0,
            clickPositionY: 0    // last mouse click position
         };
         
         // set object reference for our events
         Phoria.View.events[el.id] = mouse;
         
         mouse.onMouseMove = function onMouseMove(evt) {
         	mouse.positionX = evt.clientX;
         	mouse.velocityH = mouse.velocityLastH + (mouse.positionX - mouse.clickPositionX) * 0.5;
         	mouse.positionY = evt.clientY;
         	mouse.velocityV = mouse.velocityLastV + (mouse.positionY - mouse.clickPositionY) * 0.5;
         };
         
         mouse.onMouseUp = function onMouseUp(evt) {
         	el.removeEventListener('mousemove', mouse.onMouseMove, false);
         };
         
         mouse.onMouseOut = function onMouseOut(evt) {
         	el.removeEventListener('mousemove', mouse.onMouseMove, false);
         };
         
         mouse.onMouseDown = function onMouseDown(evt) {
         	evt.preventDefault();
         	el.addEventListener('mousemove', mouse.onMouseMove, false);
         	mouse.clickPositionX = evt.clientX;
         	mouse.velocityLastH = mouse.velocityH;
         	mouse.clickPositionY = evt.clientY;
         	mouse.velocityLastV = mouse.velocityV;
         };
         
         el.addEventListener('mousedown', mouse.onMouseDown, false);
         el.addEventListener('mouseup', mouse.onMouseUp, false);
         el.addEventListener('mouseout', mouse.onMouseOut, false);
         
         // add click handler if supplied
         if (fnOnClick) el.addEventListener('click', fnOnClick, false);
         
         return mouse;
      }
   }
   
   Phoria.View.removeMouseEvents = function removeMouseEvents(el, fnOnClick)
   {
      if (el.id)
      {
         var mouse = Phoria.View.events[el.id];
         if (mouse)
         {
            el.removeEventListener('mousemove', mouse.onMouseMove, false);
            el.removeEventListener('mousedown', mouse.onMouseDown, false);
            el.removeEventListener('mouseup', mouse.onMouseUp, false);
            el.removeEventListener('mouseout', mouse.onMouseOut, false);
            if (fnOnClick) el.removeEventListener('click', fnOnClick, false);
            Phoria.View.events[el.id] = null;
         }
      }
   }
   
   Phoria.View.getMouse = function getMouse(el)
   {
      return Phoria.View.events[el.id];
   }
   
   Phoria.View.calculateClickPointAndVector = function calculateClickPointAndVector(scene, mousex, mousey)
   {
      var camLookAt = vec3.fromValues(
         scene.camera.lookat.x,
         scene.camera.lookat.y,
         scene.camera.lookat.z);
      var camOff = vec3.subtract(vec3.create(), scene._cameraPosition, camLookAt);
      
      // get pixels per unit at click plane (plane normal to camera direction going through the camera focus point)
      var pixelsPerUnit = (scene.viewport.height / 2) / (vec3.length(camOff) * Math.tan((scene.perspective.fov / 180 * Math.PI) / 2));
      
      // calculate world units (from the centre of canvas) corresponding to the mouse click position
      var dif = vec2.fromValues(mousex - (scene.viewport.width / 2), mousey - (scene.viewport.height / 2));
      vec2.subtract(dif, dif, new vec2.fromValues(8, 8)); // calibrate
      var units = vec2.create();
      vec2.scale(units, dif, 1 / pixelsPerUnit);
      
      // move click point horizontally on click plane by the number of units calculated from the x offset of the mouse click
      var upVector = vec3.fromValues(scene.camera.up.x, scene.camera.up.y, scene.camera.up.z);
      var normalVectorSide = vec3.create();
      vec3.cross(normalVectorSide, camOff, upVector);
      vec3.normalize(normalVectorSide, normalVectorSide);
      var clickPoint = vec3.scaleAndAdd(vec3.create(), camLookAt, normalVectorSide, units[0]);
      
      // move click point vertically on click plane by the number of units calculated from the y offset of the mouse click
      var normalVectorUp = vec3.create();
      vec3.cross(normalVectorUp, normalVectorSide, camOff);
      vec3.normalize(normalVectorUp, normalVectorUp);
      vec3.scale(normalVectorUp, normalVectorUp, units[1]);
      vec3.subtract(clickPoint, clickPoint, normalVectorUp);
      
      // calculate click vector (vector from click point to the camera's position)
      var camVector = vec3.add(vec3.create(), camLookAt, camOff);
      return {
         clickPoint: clickPoint,
         clickVector: vec3.subtract(vec3.create(), clickPoint, camVector)
      };
   }
   
   Phoria.View.getIntersectedObjects = function getIntersectedObjects(scene, clickPoint, clickVector)
   {
      var intersections = [], obj, polygonNormal, polygonPoint, polygonCoords, polygonPlaneIntersection, pointVector;
      
      // Go through all the appropriate objects
      var objects = scene.renderlist;
      for (var n = 0, obj; n < objects.length; n++)
      {
         obj = objects[n];
         
         // only consider solid objects
         if (obj.style.drawmode !== "solid") continue;
         
         // Go through all the polygons of an object
         for (var m = 0; m < obj.polygons.length; m++)
         {
            polygonNormal = vec3.clone(obj.polygons[m]._worldnormal);
            polygonPoint = vec3.clone(obj._worldcoords[obj.polygons[m].vertices[0]]);
            
            // Get the point where the line intersectects the polygon's plane
            polygonPlaneIntersection = Phoria.Util.planeLineIntersection(polygonNormal, polygonPoint, clickVector, clickPoint);
            
            // if the intersection is null, it means the line does not intersect the plane
            if (polygonPlaneIntersection !== null)
            {
               // Check if the intersection is inside the polygon
               if (Phoria.Util.intersectionInsidePolygon(obj.polygons[m], obj._worldcoords, polygonPlaneIntersection))
               {
                  // add intersection to the array being returned
                  var returnObject = {
                     entity: obj,
                     polygonIndex: m,
                     intersectionPoint: polygonPlaneIntersection
                  };
                  intersections.push(returnObject);
               }
            }
         }
      }
      
      // calculate distance to each intersection from camera's position
      for (var i = 0; i < intersections.length; i++)
      {
         intersections[i].distance = vec3.distance(scene._cameraPosition, intersections[i].intersectionPoint);
      }
      
      // sort intersection points from closest to farthest
      for (var i = 0; i < intersections.length - 1; i++)
      {
         for (var j = i + 1, keepVal; j < intersections.length; j++)
         {
            if (intersections[i].distance >= intersections[j].distance)
            {
               keepVal = intersections[j];
               intersections[j] = intersections[i];
               intersections[i] = keepVal;
            }
         }
      }
      
      // return list of all intersections
      return intersections;
   }

})();
