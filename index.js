var THREE = require('./three')
var OrbitViewer = require('three-orbit-viewer')(THREE)

var mouse = require('touch-position')()
var createVignette = require('gl-vignette-background')
var createChecker = require('gl-checker-background')

require('domready')(function() {
    mouse[0] = window.innerWidth/2

    var app = OrbitViewer({
        clearColor: 0x000000,
        clearAlpha: 1.0,
        fov: 65,
        position: new THREE.Vector3(1, 1, -2)
    })
    app.renderer.autoClear = false
    
    var gl = app.renderer.getContext()
    var backgrounds = [createVignette, createChecker].map(function(create) {
        return create(gl)
    })

    var geo = new THREE.BoxGeometry(1,1,1)
    var mat = new THREE.MeshBasicMaterial({ wireframe: true, color: 0x4e7cc7 })
    var box = new THREE.Mesh(geo, mat)
    app.scene.add(box)

    var time = 0

    app.on('tick', function(dt) {
        time += dt/1000 
        box.rotation.y = Math.sin(time*0.15)

        app.renderer.clear()

        //The following bits could be placed in a 
        //Background class that extends RenderObject
        var midpoint = mouse[0] / window.innerWidth
        gl.disable(gl.CULL_FACE)
        gl.disable(gl.DEPTH_TEST)
        gl.enable(gl.SCISSOR_TEST)
        backgrounds.forEach(function(bg, i) {
            var width = gl.drawingBufferWidth,
                height = gl.drawingBufferHeight,
                off = width * midpoint,
                offX = i===0 ? 0 : off,
                offWidth = i===0 ? off : width

            gl.scissor(offX, 0, offWidth, height)
            bg.draw()
        })
        gl.disable(gl.SCISSOR_TEST)
        gl.enable(gl.DEPTH_TEST)
        gl.enable(gl.CULL_FACE)

        app.renderer.resetGLState()
    })
})