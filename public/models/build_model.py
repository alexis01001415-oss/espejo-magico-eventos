"""Build the Magic Mirror hero asset in Blender 5.x.

Run: blender -b --python public/models/build_model.py
Coordinate contract after glTF export: metres, Y up, product front +Z,
root origin at centre of the base on the floor.
"""

import bpy
import math
import os
from mathutils import Vector

ROOT_DIR = os.path.dirname(os.path.abspath(__file__))
OUT_GLB = os.path.join(ROOT_DIR, "espejo-magico.glb")
OUT_BLEND = os.path.join(ROOT_DIR, "espejo-magico.blend")
OUT_WEBP = os.path.join(ROOT_DIR, "espejo-magico-poster.webp")

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
for datablock in bpy.data.materials:
    bpy.data.materials.remove(datablock)

scene = bpy.context.scene
scene.unit_settings.system = "METRIC"
scene.unit_settings.scale_length = 1.0


def material(name, color, metallic=0.0, roughness=0.5, emission=None, strength=0.0, alpha=1.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    p = m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value = (*color, alpha)
    p.inputs["Metallic"].default_value = metallic
    p.inputs["Roughness"].default_value = roughness
    p.inputs["Alpha"].default_value = alpha
    if emission:
        p.inputs["Emission Color"].default_value = (*emission, 1)
        p.inputs["Emission Strength"].default_value = strength
    m.diffuse_color = (*color, alpha)
    if alpha < 1:
        m.surface_render_method = "DITHERED"
    return m


MAT_WHITE = material("Porcelain white coated aluminium", (0.80, 0.88, 0.94), .42, .22)
MAT_WHITE_EDGE = material("Soft pearl-white bevel", (.91, .96, 1.0), .28, .2)
MAT_GRAPHITE = material("Graphite powder coat", (.018, .026, .038), .45, .27)
MAT_BLACK = material("Black optical polymer", (.004, .006, .012), .05, .22)
MAT_CHROME = material("Satin machined chrome", (.54, .64, .72), .92, .16)
MAT_MIRROR = material("One-way mirror dark blue glass", (.024, .049, .076), .78, .075)
MAT_DISPLAY = material("OLED touch display", (.012, .033, .075), .18, .27, (.018, .08, .16), .30)
MAT_DISPLAY_SOFT = material("UI translucent blue", (.09, .45, .74), .11, .23, (.03, .22, .4), .5, .81)
MAT_TIRE = material("Caster polyurethane", (.018, .022, .03), .04, .81)
MAT_LENS = material("Camera lens coating", (.008, .019, .038), .7, .055)
MAT_LENS_HIGHLIGHT = material("Lens reflection", (.14, .43, .68), .35, .10)
MAT_VENT = material("Vent recessed shadow", (.07, .095, .12), .2, .8)
MAT_LIGHT = material("Soft light diffuser", (.86, .94, 1), .06, .52, (.84, .9, 1), 1.0)
LED_COLORS = [
    (.14, .78, 1.0), (.18, .42, 1.0), (.43, .28, 1.0),
    (.86, .20, .85), (1.0, .25, .48), (1.0, .57, .18),
    (.98, .83, .12), (.26, 1.0, .29),
]
MAT_LED = [material(f"RGB LED {i:02d}", c, .03, .35, c, 2.1) for i, c in enumerate(LED_COLORS)]


def empty(name, loc=(0, 0, 0), parent=None):
    e = bpy.data.objects.new(name, None)
    bpy.context.collection.objects.link(e)
    e.location = loc
    e.empty_display_type = "PLAIN_AXES"
    e.empty_display_size = .04
    if parent:
        parent_keep_world(e, parent)
    return e


def parent_keep_world(ob, parent):
    bpy.context.view_layer.update()
    world = ob.matrix_world.copy()
    ob.parent = parent
    ob.matrix_world = world


def assign(ob, mat, parent=None):
    ob.data.materials.append(mat)
    if parent:
        parent_keep_world(ob, parent)
    return ob


def cube(name, loc, size, mat, bevel=0, parent=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = bpy.context.object
    ob.name = name
    ob.dimensions = size
    bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
    if bevel:
        mod = ob.modifiers.new("Soft machined edges", "BEVEL")
        mod.width = bevel
        mod.segments = 3
        bpy.context.view_layer.objects.active = ob
        bpy.ops.object.modifier_apply(modifier=mod.name)
        mod2 = ob.modifiers.new("Weighted normals", "WEIGHTED_NORMAL")
        bpy.ops.object.modifier_apply(modifier=mod2.name)
    return assign(ob, mat, parent)


def cylinder(name, loc, radius, depth, mat, segments=32, axis="Y", parent=None):
    bpy.ops.mesh.primitive_cylinder_add(vertices=segments, radius=radius, depth=depth, location=loc)
    ob = bpy.context.object
    ob.name = name
    if axis == "Y":
        ob.rotation_euler[0] = math.pi / 2
    elif axis == "X":
        ob.rotation_euler[1] = math.pi / 2
    return assign(ob, mat, parent)


def torus(name, loc, major, minor, mat, parent=None, axis="Y"):
    bpy.ops.mesh.primitive_torus_add(major_segments=64, minor_segments=8, location=loc,
        major_radius=major, minor_radius=minor)
    ob = bpy.context.object
    ob.name = name
    if axis == "Y":
        ob.rotation_euler[0] = math.pi / 2
    return assign(ob, mat, parent)


def rounded_points(width, height, radius, seg=10):
    w, h = width/2, height/2
    r = min(radius, w, h)
    corner_data = [
        (w-r, h-r, 0), (-w+r, h-r, math.pi/2),
        (-w+r, -h+r, math.pi), (w-r, -h+r, math.pi*1.5),
    ]
    pts = []
    for cx, cz, start in corner_data:
        for j in range(seg+1):
            a = start + (math.pi/2) * j/seg
            pts.append((cx+r*math.cos(a), cz+r*math.sin(a)))
    return pts


def rounded_slab(name, loc, width, height, depth, radius, mat, parent=None):
    pts = rounded_points(width, height, radius)
    n = len(pts)
    verts = [(x, -depth/2, z) for x,z in pts] + [(x, depth/2, z) for x,z in pts]
    faces = [tuple(range(n)), tuple(reversed(range(n, 2*n)))]
    for i in range(n):
        k = (i+1)%n
        faces.append((i, n+i, n+k, k))
    mesh = bpy.data.meshes.new(name+" mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    assign(ob, mat, parent)
    return ob


def rounded_ring(name, loc, outer, inner, radius_outer, radius_inner, mats, parent=None):
    a = rounded_points(outer[0], outer[1], radius_outer)
    b = rounded_points(inner[0], inner[1], radius_inner)
    n = len(a)
    verts = [(x, 0, z) for x,z in a] + [(x, 0, z) for x,z in b]
    faces = [(i,(i+1)%n,n+(i+1)%n,n+i) for i in range(n)]
    mesh = bpy.data.meshes.new(name+" mesh")
    mesh.from_pydata(verts, [], faces)
    mesh.update()
    for m in mats:
        mesh.materials.append(m)
    for i, poly in enumerate(mesh.polygons):
        # Chromatic spectrum follows the edge. Separate faces allow per-segment animation later.
        poly.material_index = min(len(mats)-1, int(i*len(mats)/n))
    ob = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(ob)
    ob.location = loc
    if parent:
        parent_keep_world(ob, parent)
    return ob


def bar_between(name, a, b, width, depth, mat, parent=None):
    mid = (Vector(a)+Vector(b))/2
    d = Vector(b)-Vector(a)
    ob = cube(name, mid, (width, depth, d.length), mat, min(width,depth)*.15, parent)
    ob.rotation_euler = d.to_track_quat('Z','Y').to_euler()
    return ob


root = empty("MagicMirror_Root")
root["coordinate_contract"] = "glTF metres; Y up; front +Z; origin floor beneath centre of base"
root["product_reference"] = "Amazon ASIN B0GCBZPJ5D (visual silhouette, not verified CAD)"
root["nominal_height_m"] = 1.63
root["nominal_width_m"] = .45

groups = {}
for name, pivot in [
    ("Chassis", (0,0,1.145)),
    ("MirrorGlass", (0,-.055,1.145)),
    ("TouchDisplay", (0,-.065,1.09)),
    ("LED_Frame", (0,-.065,1.145)),
    ("Camera", (0,-.071,1.46)),
    ("RearHousing", (0,.055,1.16)),
    ("Stand", (0,.10,.40)),
    ("PrinterShelf", (0,.23,.43)),
    ("Wheels", (0,.10,.038)),
    ("SoftboxUmbrella", (0,.08,1.85)),
]:
    groups[name] = empty(name, pivot, root)

# Main head: 0.45 m wide, 0.96 m tall, from approximately 0.67 to 1.63 m.
rounded_slab("Head shell | pearl alloy", (0,.002,1.145), .45,.97,.095,.039,MAT_WHITE,groups["Chassis"])
rounded_slab("Front graphite gasket", (0,-.050,1.145), .440,.957,.005,.037,MAT_GRAPHITE,groups["Chassis"])
rounded_ring("Front chrome reveal", (0,-.056,1.145), (.442,.96),(.430,.947),.038,.034,[MAT_CHROME],groups["Chassis"])
rounded_slab("One-way mirror glass", (0,-.059,1.145), .428,.945,.004,.033,MAT_MIRROR,groups["MirrorGlass"])
rounded_ring("Inner glass cut line", (0,-.062,1.145),(.414,.928),(.410,.924),.032,.031,[MAT_WHITE_EDGE],groups["MirrorGlass"])

# RGB diffuser: a slim inset rounded path. Material slices reproduce the spectrum on the source product.
rounded_ring("RGB perimeter diffuser", (0,-.064,1.145),(.385,.884),(.371,.870),.031,.027,MAT_LED,groups["LED_Frame"])
rounded_ring("RGB recess | black trim", (0,-.063,1.145),(.398,.899),(.387,.887),.035,.031,[MAT_BLACK],groups["LED_Frame"])

# A real display would be behind the one-way glass. The topmost tinted surface makes it legible in glTF.
rounded_slab("21.5in display active area",(0,-.0642,1.07),.246,.438,.001,.008,MAT_DISPLAY,groups["TouchDisplay"])
rounded_ring("Display perimeter seal",(0,-.0645,1.07),(.254,.447),(.245,.438),.009,.008,[MAT_BLACK],groups["TouchDisplay"])
# Restrained, neutral preview graphics (not claims about production software).
rounded_slab("Display quiet blue upper field",(0,-.0651,1.18),.218,.158,.0006,.004,MAT_DISPLAY_SOFT,groups["TouchDisplay"])
for i,(x,z,w,h) in enumerate([
    (-.058,.984,.096,.09),(.058,.984,.096,.09),
    (-.058,.884,.096,.09),(.058,.884,.096,.09),
]):
    mat = [MAT_LED[1],MAT_LED[2],MAT_LED[0],MAT_LED[3]][i]
    rounded_slab(f"Touch tile {i+1:02d}",(x,-.0654,z),w,h,.0005,.006,mat,groups["TouchDisplay"])
torus("Touch halo outer",(0,-.066,1.23),.044,.0028,MAT_LED[0],groups["TouchDisplay"])
torus("Touch halo inner",(0,-.0661,1.23),.027,.0019,MAT_LED[2],groups["TouchDisplay"])
cylinder("Touch target",(0,-.0663,1.23),.011,.0008,MAT_LIGHT,32,"Y",groups["TouchDisplay"])

# Circular camera aperture and RGB ring; camera pivots independently for the part tour.
cylinder("Camera black aperture",(0,-.066,1.457),.042,.012,MAT_BLACK,64,"Y",groups["Camera"])
torus("Camera RGB halo",(0,-.075,1.457),.044,.005,MAT_LED[2],groups["Camera"])
torus("Camera brushed inner bezel",(0,-.077,1.457),.029,.0032,MAT_CHROME,groups["Camera"])
cylinder("Camera lens barrel",(0,-.078,1.457),.026,.012,MAT_GRAPHITE,48,"Y",groups["Camera"])
cylinder("Camera optical glass",(0,-.085,1.457),.020,.001,MAT_LENS,48,"Y",groups["Camera"])
cylinder("Camera glass inner reflection",(-.005,-.086,1.462),.006,.0005,MAT_LENS_HIGHLIGHT,32,"Y",groups["Camera"])

# Back: camera access hatch, ventilation, electronics door and separate serviceable printer shelf.
rounded_slab("Rear alloy enclosure",(0,.064,1.145),.432,.945,.028,.035,MAT_WHITE,groups["RearHousing"])
rounded_slab("Upper camera service hatch",(0,.081,1.425),.257,.230,.002,.012,MAT_WHITE_EDGE,groups["RearHousing"])
rounded_ring("Upper hatch seam",(0,.083,1.425),(.258,.23),(.255,.227),.012,.011,[MAT_CHROME],groups["RearHousing"])
rounded_slab("Lower computer service hatch",(0,.081,.95),.29,.414,.002,.010,MAT_WHITE_EDGE,groups["RearHousing"])
rounded_ring("Lower hatch seam",(0,.083,.95),(.290,.414),(.287,.411),.010,.009,[MAT_CHROME],groups["RearHousing"])
for row in range(10):
    for col in range(7):
        cube(f"Rear vent {row:02d}-{col:02d}",((col-3)*.031,.084,1.29-row*.020),(.020,.0008,.0032),MAT_VENT,.001,groups["RearHousing"])
cylinder("Top lock",(.10,.085,1.505),.008,.004,MAT_CHROME,16,"Y",groups["RearHousing"])
cylinder("Bottom lock",(.11,.085,1.015),.008,.004,MAT_CHROME,16,"Y",groups["RearHousing"])
for x in (-.21,.21):
    for z in (.75,1.50):
        cylinder(f"Side screw {x:+.2f} {z:.2f}",(x,.019,z),.006,.003,MAT_CHROME,12,"X",groups["RearHousing"])

# Low pedestal and wide, smoothly bevelled wheeled base follow the actual product.
cube("Central pedestal",(0,.065,.390),(.255,.165,.552),MAT_WHITE,.015,groups["Stand"])
cube("Pedestal front inset",(0,-.020,.39),(.207,.006,.493),MAT_WHITE_EDGE,.008,groups["Stand"])
cube("Neck coupling",(0,.035,.673),(.225,.155,.054),MAT_CHROME,.008,groups["Stand"])
cube("Lower plinth",(0,.096,.083),(.46,.425,.075),MAT_WHITE,.030,groups["Stand"])
cube("Base chrome bottom reveal",(0,.096,.044),(.448,.412,.007),MAT_CHROME,.003,groups["Stand"])
for x in (-.132,.132):
    for z in (.195,.50):
        cylinder(f"Stand side attachment {x:+.3f} {z:.3f}",(x,.065,z),.009,.008,MAT_CHROME,20,"X",groups["Stand"])

# Rear printer support is included; a printer is optional and therefore not fabricated here.
cube("Rear mounting column",(0,.179,.443),(.184,.069,.400),MAT_WHITE,.008,groups["PrinterShelf"])
cube("Printer shelf tray",(0,.259,.323),(.302,.235,.021),MAT_WHITE,.006,groups["PrinterShelf"])
cube("Tray dark anti-slip mat",(0,.259,.336),(.265,.205,.001),MAT_GRAPHITE,.001,groups["PrinterShelf"])
for x in (-.114,.114):
    bar_between(f"Shelf brace {x:+.2f}",(x,.13,.50),(x,.33,.324),.012,.012,MAT_CHROME,groups["PrinterShelf"])

# Four working-style swivel casters, small enough to retain the product's base silhouette.
for x in (-.181,.181):
    for y in (-.049,.238):
        tag=f"{'L' if x<0 else 'R'}{'F' if y<.1 else 'B'}"
        cylinder(f"Caster post {tag}",(x,y,.043),.013,.026,MAT_CHROME,16,"Z",groups["Wheels"])
        cube(f"Caster fork {tag}",(x,y,.031),(.034,.027,.026),MAT_CHROME,.004,groups["Wheels"])
        cylinder(f"Caster tire {tag}",(x,y,.021),.021,.019,MAT_TIRE,24,"X",groups["Wheels"])
        cylinder(f"Caster hub {tag}",(x+(.010 if x>0 else -.010),y,.021),.009,.002,MAT_CHROME,20,"X",groups["Wheels"])

# Detachable soft-light umbrella: simplified radial ribs and translucent octagonal cloth.
# It is a top-level named group for hiding in the hero and revealing in an exploded sequence.
cube("Umbrella mount",(0,.060,1.662),(.046,.048,.038),MAT_GRAPHITE,.006,groups["SoftboxUmbrella"])
bar_between("Umbrella boom",(0,.060,1.665),(0,.205,1.91),.018,.018,MAT_CHROME,groups["SoftboxUmbrella"])
cylinder("Studio flash housing",(0,.132,1.786),.046,.130,MAT_GRAPHITE,20,"Z",groups["SoftboxUmbrella"])
cylinder("Studio flash rear dial",(0,.132,1.721),.034,.008,MAT_BLACK,20,"Z",groups["SoftboxUmbrella"])

def make_umbrella(name, center, radius, height, parent):
    # White faceted dome pitched toward the guest: enough structure to read as a real softbox.
    cx,cy,cz=center
    verts=[(cx,cy,cz)]
    n=12
    for i in range(n):
        a=2*math.pi*i/n
        verts.append((cx+radius*math.cos(a),cy+.065,cz+height+radius*.82*math.sin(a)))
    faces=[(0,i+1,((i+1)%n)+1) for i in range(n)]
    mesh=bpy.data.meshes.new(name+" mesh")
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    ob=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(ob)
    assign(ob,MAT_LIGHT,parent)
    for i in range(n):
        a=2*math.pi*i/n
        end=(cx+radius*math.cos(a),cy+.065,cz+height+radius*.82*math.sin(a))
        bar_between(f"Umbrella rib {i:02d}",center,end,.003,.003,MAT_CHROME,parent)
    return ob

make_umbrella("White 12-panel softbox canopy",(0,.255,1.95),.38,.16,groups["SoftboxUmbrella"])

def join_named(prefix, new_name):
    objects=[o for o in bpy.data.objects if o.type=='MESH' and o.name.startswith(prefix)]
    if len(objects)<2:
        return
    bpy.ops.object.select_all(action='DESELECT')
    for ob in objects:
        ob.select_set(True)
    bpy.context.view_layer.objects.active=objects[0]
    bpy.ops.object.join()
    objects[0].name=new_name

# Hundreds of geometric details remain visible, but repeated ones share draw calls.
join_named("Rear vent ", "Rear ventilation grille")
join_named("Umbrella rib ", "Umbrella radial aluminium ribs")

# Save editable source and export the complete hierarchy. The umbrella is visible in the GLB.
bpy.ops.wm.save_as_mainfile(filepath=OUT_BLEND)
bpy.ops.export_scene.gltf(
    filepath=OUT_GLB, export_format="GLB", export_yup=True,
    export_apply=False, export_cameras=False, export_lights=False,
    export_extras=True, export_texcoords=False, export_normals=True,
    export_materials="EXPORT", export_image_format="AUTO",
)

# Product poster: render only the equipment so fallback shares the hero silhouette.
groups["SoftboxUmbrella"].hide_render = True
for ob in groups["SoftboxUmbrella"].children_recursive:
    ob.hide_render=True
scene.render.engine = "CYCLES"
scene.cycles.samples = 32
scene.cycles.use_denoising = True
scene.render.resolution_x = 900
scene.render.resolution_y = 1200
scene.render.resolution_percentage = 100
scene.render.film_transparent = True
scene.render.image_settings.file_format = "WEBP"
scene.render.image_settings.color_mode = "RGBA"
scene.render.image_settings.quality = 83
scene.render.filepath = OUT_WEBP
scene.world.color = (.08,.10,.14)

def area(name, loc, energy, size, color):
    data=bpy.data.lights.new(name,"AREA")
    data.energy=energy
    data.shape="DISK"
    data.size=size
    data.color=color
    ob=bpy.data.objects.new(name,data)
    bpy.context.collection.objects.link(ob)
    ob.location=loc
    ob.rotation_euler=(Vector((0,0,.85))-ob.location).to_track_quat('-Z','Y').to_euler()

area("Key large softbox",(-1.0,-1.8,2.5),320,2.0,(.72,.85,1))
area("Warm rim",(1.2,.75,1.75),220,1.15,(.88,.93,1))
area("Front fill",(.25,-2.2,.8),130,1.5,(.70,.87,1))
data=bpy.data.cameras.new("Poster orthographic camera")
camera=bpy.data.objects.new("Poster orthographic camera",data)
bpy.context.collection.objects.link(camera)
camera.location=(1.02,-2.25,1.27)
target=Vector((0,.09,.83))
camera.rotation_euler=(target-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type="ORTHO"
camera.data.ortho_scale=1.96
scene.camera=camera
scene.view_settings.view_transform="AgX"
bpy.ops.render.render(write_still=True)
print("MODEL_OUTPUT",OUT_GLB,OUT_BLEND,OUT_WEBP)
