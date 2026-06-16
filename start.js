import streamlit as st
import math
import uuid
import pandas as pd

# Set page config with pristine dark-mode friendly custom titles
st.set_page_config(
    page_title="Moment of Inertia Calculator",
    page_icon="📐",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom css for high contrast engineering dashboard feel
st.markdown("""
<style>
    /* Styling metric custom cards */
    .metric-card {
        background-color: #1e293b;
        border-left: 5px solid #000;
        border-radius: 8px;
        padding: 16px;
        margin-bottom: 12px;
        border: 1px solid #334155;
    }
    .metric-title {
        font-size: 11px;
        text-transform: uppercase;
        color: #94a3b8;
        font-weight: bold;
        letter-spacing: 0.1em;
        margin-bottom: 4px;
        font-family: monospace;
    }
    .metric-value {
        font-size: 20px;
        font-weight: bold;
        color: #ffffff;
        font-family: 'Inter', sans-serif;
    }
    .metric-unit {
        font-size: 12px;
        color: #38bdf8;
        margin-left: 4px;
        font-weight: 500;
    }
    /* Expander card header tweaking */
    .st-emotion-cache-1px78ff {
        background-color: #0f172a !important;
        border: 1px solid #1e293b !important;
    }
</style>
""", unsafe_allow_html=True)

# Define bilingual dictionaries
L = {
    "English": {
        "title": "📐 Section Moment of Inertia Calculator",
        "sub": "An interactive engineering tool for advanced centroid & Parallel Axis Theorem (Ix, Iy) analysis",
        "lang_select": "Languages / 語言",
        "preset_sec": "Standard Profiles (Presets)",
        "preset_label": "Select preset to load:",
        "preset_loaded": "Preset '{}' successfully loaded!",
        "custom_label": "Custom Compounds / Free Edit",
        "shape_list_sec": "📝 Composite Segments List",
        "add_shape_sec": "➕ Introduce Structural Element",
        "add_shape_lbl": "Element geometry:",
        "add_btn_text": "Add Geometry Block",
        "delete_confirm": "Confirm Delete",
        "is_hole_lbl": "Material state:",
        "solid_opt": "Solid Material (+ Area)",
        "hole_opt": "Void / Hole (- Area)",
        "name_lbl": "Label/Name",
        "pos_sec": "Position / Centers Offsets",
        "dim_sec": "Structural Dimensions",
        "b_mm": "Width b (mm)",
        "h_mm": "Height h (mm)",
        "r_mm": "Radius r (mm)",
        "R_mm": "Outer Radius R (mm)",
        "bf_mm": "Flange Width bf (mm)",
        "tf_mm": "Flange Thickness tf (mm)",
        "tw_mm": "Web Thickness tw (mm)",
        "t_mm": "Wall Thickness t (mm)",
        "cx_lbl": "cx (X center displacement, mm)",
        "cy_lbl": "cy (Y center displacement, mm)",
        
        "tab_summary": "📊 Properties Summary",
        "tab_centroid_steps": "📐 Centroid Analytical Steps",
        "tab_pat_steps": "⛓️ Parallel Axis Theorem Matrix",
        
        "total_area": "Combined Area",
        "centroid_u": "Composite Centroid Axis",
        "ix_lbl": "Moment of Inertia Ix",
        "iy_lbl": "Moment of Inertia Iy",
        "rx_lbl": "Radius of Gyration rx",
        "ry_lbl": "Radius of Gyration ry",
        
        "canvas_title": "Interactive Section View",
        "scale_desc": "Scale coordinate mesh updated live with standard reference axes.",
        "steps_desc": "Subshape parameters are evaluated step-by-step to calculate centroid (X̄, Ȳ) and section Moments of Inertia components.",
        "empty_warning": "No geometry components loaded. Choose a Preset in the left sidebar or click 'Add Geometry Block' to create one!",
        "formulas_centroid": "1. Centroidal Neutral Axes Calculation",
        "formulas_moi": "2. Moments of Inertia with Parallel Axis Correction (Ix, Iy)",
        "theory_text": "The composite neutrality parameters are obtained via static area moments, and the composite major inertia properties are combined using the Parallel-Axis Theorem: $I = I_{0} + A d^2$."
    },
    "繁體中文": {
        "title": "📐 截面形心與慣性矩計算器",
        "sub": "基於平行軸定理（Parallel Axis Theorem）的複雜截面幾何與慣性矩（Ix, Iy）力學分析系統",
        "lang_select": "Languages / 語言",
        "preset_sec": "標準工程固體截面預設",
        "preset_label": "選擇欲載入的預設：",
        "preset_loaded": "已成功載入預設： '{}'！",
        "custom_label": "自由設計 / 自定義多重複合",
        "shape_list_sec": "📝 各子幾何元件編輯清單",
        "add_shape_sec": "➕ 新增截面元件",
        "add_shape_lbl": "截面幾何形狀：",
        "add_btn_text": "新增截面元件",
        "delete_confirm": "確認刪除元件",
        "is_hole_lbl": "材料實體狀態：",
        "solid_opt": "實體材質 (+ 面積/剛度)",
        "hole_opt": "中空開孔 (- 面積/扣減)",
        "name_lbl": "元件名稱/標記",
        "pos_sec": "幾何中心偏移位置 (Displacement)",
        "dim_sec": "元件結構幾何尺寸 (Measurements)",
        "b_mm": "寬度 b (mm)",
        "h_mm": "高度 h (mm)",
        "r_mm": "半徑 r (mm)",
        "R_mm": "外圓半徑 R (mm)",
        "bf_mm": "翼板寬度 bf (mm)",
        "tf_mm": "翼板厚度 tf (mm)",
        "tw_mm": "腹板厚度 tw (mm)",
        "t_mm": "管/箱壁厚度 t (mm)",
        "cx_lbl": "cx (X向偏移 displacements, mm)",
        "cy_lbl": "cy (Y向偏移 displacements, mm)",
        
        "tab_summary": "📊 數據計算總覽",
        "tab_centroid_steps": "📐 形心理論詳解步驟",
        "tab_pat_steps": "⛓️ 平行軸定理矩陣表格",
        
        "total_area": "截面總面積 (A)",
        "centroid_u": "複合幾何中心形心 (X̄, Ȳ)",
        "ix_lbl": "主要慣性矩 Ix",
        "iy_lbl": "主要慣性矩 Iy",
        "rx_lbl": "迴轉半徑 (慣性半徑) rx",
        "ry_lbl": "迴轉半徑 (慣性半徑) ry",
        
        "canvas_title": "交互式截面視覺圖檔",
        "scale_desc": "自動按比例縮放幾何，網格代表標註，實體元件顯示為色塊，而扣減孔洞則疊加斜向網格線標記。",
        "steps_desc": "系統會根據各子形狀對 (0, 0) 的力矩疊加來計算主形心 (X̄, Ȳ)，進而以該座標組為基準應用平行軸原理。",
        "empty_warning": "目前截面中無幾何元件，請於左側欄位點選工程預設載入，或按「新增截面元件」手動構造複合截面！",
        "formulas_centroid": "1. 複合形心中性軸求解步驟",
        "formulas_moi": "2. 主軸慣性矩與平行軸修正 (Ix, Iy)",
        "theory_text": "本系統基於材料力學平行軸定理公式計算：$I = I_{0} + A d^2$。其中 $I_{0}$ 是子幾何繞自身二次形心軸的局部慣性矩，$d$ 是其中心至全截面形心中性軸之垂直距離。"
    }
}

# Default preset sections
def get_presets_data():
    return {
        "rectangle": {
            "nameZh": "單一實心矩形",
            "nameEn": "Solid Rectangle",
            "descZh": "最基礎的截面，形心位於幾何中心。Ix = b·h³/12, Iy = h·b³/12。",
            "descEn": "The most basic section with centroid at geometric center. Ix = bh³/12, Iy = hb³/12.",
            "shapes": [
                {
                    "id": "rect_1",
                    "name": "Main Plate / 主板件",
                    "type": "rectangle",
                    "width": 60.0,
                    "height": 100.0,
                    "radius": 0.0,
                    "cx": 0.0,
                    "cy": 0.0,
                    "isHole": False
                }
            ]
        },
        "box": {
            "nameZh": "空心箱型截面",
            "nameEn": "Hollow Box Section",
            "descZh": "中空結構，常用於梁柱，透過一鍵設定中空箱元件，外框寬度高與其壁厚進行矩形管剛度抵消。",
            "descEn": "Hollow structural section (HSS), featuring full double-symmetric outer boundaries minus local hollow core thickness.",
            "shapes": [
                {
                    "id": "box_1",
                    "name": "Hollow Box / 矩形箱管",
                    "type": "hollowrect",
                    "width": 80.0,
                    "height": 80.0,
                    "radius": 0.0,
                    "cx": 0.0,
                    "cy": 0.0,
                    "isHole": False,
                    "thickness": 6.0
                }
            ]
        },
        "ibeam": {
            "nameZh": "工字鋼 (I型雙對稱)",
            "nameEn": "I-Beam (Universal Section)",
            "descZh": "效率極高的抗彎截面，本系統支持直接原生工字型件（設定腹板與翼厚），省卻三個拼合板逐片校準的麻煩！",
            "descEn": "Composed of Top Flange, Web, and Bottom Flange. Highly optimized for bending in structural steel framing.",
            "shapes": [
                {
                    "id": "ibeam_1",
                    "name": "I-Section / 標準工型件",
                    "type": "ibeam",
                    "width": 0.0,
                    "height": 120.0,
                    "radius": 0.0,
                    "cx": 0.0,
                    "cy": 0.0,
                    "isHole": False,
                    "fWidth": 90.0,
                    "fThickness": 15.0,
                    "wThickness": 12.0
                }
            ]
        },
        "tsection": {
            "nameZh": "T型鋼 (單軸對稱)",
            "nameEn": "T-Section",
            "descZh": "非對稱截面，由翼板與腹板拼合，形心會偏向高剛性的翼板一側（偏離中心線）。",
            "descEn": "Asymmetrical flanged profile with single-axis symmetry where centroid is biased naturally towards flanged side.",
            "shapes": [
                {
                    "id": "tsec_1",
                    "name": "T-Beam / T型元件",
                    "type": "tsection",
                    "width": 0.0,
                    "height": 100.0,
                    "radius": 0.0,
                    "cx": 0.0,
                    "cy": 0.0,
                    "isHole": False,
                    "fWidth": 90.0,
                    "fThickness": 16.0,
                    "wThickness": 16.0
                }
            ]
        },
        "composite_hole": {
            "nameZh": "矩形孔洞抵消組合",
            "nameEn": "Solid Block with Hole cutout",
            "descZh": "展示將外矩形實體件（60x100）在中心正上方偏移 25mm 軸位置減去一個半徑 15mm 圓形孔洞的負剛性組合。",
            "descEn": "Illustrates custom parallel compound subtracting a circular void representing an eccentric hole cutout.",
            "shapes": [
                {
                    "id": "comp_plate",
                    "name": "Solid Plate / 外實心矩骨",
                    "type": "rectangle",
                    "width": 80.0,
                    "height": 100.0,
                    "radius": 0.0,
                    "cx": 0.0,
                    "cy": 0.0,
                    "isHole": False
                },
                {
                    "id": "comp_void",
                    "name": "Circular Hole / 扣除圓孔",
                    "type": "circle",
                    "width": 0.0,
                    "height": 0.0,
                    "radius": 20.0,
                    "cx": 10.0,
                    "cy": 20.0,
                    "isHole": True
                }
            ]
        }
    }

# ----------------- SESSION STATE INITS -----------------
if "shapes" not in st.session_state:
    # Warm initialization with Standard I-Beam preset
    preset_data = get_presets_data()
    st.session_state.shapes = [dict(s) for s in preset_data["ibeam"]["shapes"]]
if "prev_preset_sel" not in st.session_state:
    st.session_state.prev_preset_sel = "ibeam"

# ----------------- MATH CORE ENGINE -----------------
def calculate_section_properties(shapes):
    if not shapes:
        return {
            "centroid": {
                "x": 0.0,
                "y": 0.0,
                "totalArea": 0.0,
                "steps": {
                    "totalAreaFormula": "∑A_i = 0",
                    "totalAreaVal": 0.0,
                    "sumAx": 0.0,
                    "sumAy": 0.0,
                    "xBarFormula": "X̄ = 0",
                    "yBarFormula": "Ȳ = 0"
                }
            },
            "rows": [],
            "totalIx": 0.0,
            "totalIy": 0.0,
            "rx": 0.0,
            "ry": 0.0
        }
        
    totalArea = 0.0
    sumAx = 0.0
    sumAy = 0.0
    rows = []
    
    for shape in shapes:
        area = 0.0
        ix0 = 0.0
        iy0 = 0.0
        ix0Formula = ""
        iy0Formula = ""
        
        sign = -1.0 if shape.get('isHole', False) else 1.0
        t = shape['type']
        
        if t == 'rectangle':
            w = float(shape['width'])
            h = float(shape['height'])
            area = w * h
            ix0 = (w * (h ** 3)) / 12.0
            iy0 = (h * (w ** 3)) / 12.0
            ix0Formula = f"(b·h³)/12 = ({w:.1f}·{h:.1f}³)/12"
            iy0Formula = f"(h·b³)/12 = ({h:.1f}·{w:.1f}³)/12"
            
        elif t == 'circle':
            r = float(shape['radius'])
            area = math.pi * (r ** 2)
            ix0 = (math.pi * (r ** 4)) / 4.0
            iy0 = ix0
            ix0Formula = f"(π·r⁴)/4 = (π·{r:.1f}⁴)/4"
            iy0Formula = f"(π·r⁴)/4 = (π·{r:.1f}⁴)/4"
            
        elif t == 'ibeam':
            bf = float(shape.get('fWidth', 80.0))
            h = float(shape['height'])
            tf = float(shape.get('fThickness', 15.0))
            tw = float(shape.get('wThickness', 12.0))
            hw = max(1.0, h - 2.0 * tf)
            
            area = 2.0 * bf * tf + hw * tw
            ix0 = (bf * (h ** 3)) / 12.0 - ((bf - tw) * (hw ** 3)) / 12.0
            iy0 = (2.0 * tf * (bf ** 3)) / 12.0 + (hw * (tw ** 3)) / 12.0
            ix0Formula = f"[(bf·h³)-(bf-tw)·hw³]/12 = [({bf:.1f}·{h:.1f}³)-({bf-tw:.1f})·{hw:.1f}³]/12"
            iy0Formula = f"[2·tf·bf³+hw·tw³]/12 = [2·{tf:.1f}·{bf:.1f}³+{hw:.1f}·{tw:.1f}³]/12"
            
        elif t == 'tsection':
            bf = float(shape.get('fWidth', 90.0))
            h = float(shape['height'])
            tf = float(shape.get('fThickness', 16.0))
            tw = float(shape.get('wThickness', 16.0))
            hw = max(1.0, h - tf)
            
            Af = bf * tf
            Aw = tw * hw
            area = Af + Aw
            
            # Local centroid relative to bottom edge of stem
            yBase = (Aw * (hw / 2.0) + Af * (hw + tf / 2.0)) / area if area > 0 else 0
            df = (hw + tf / 2.0) - yBase
            dw = yBase - hw / 2.0
            
            ix0 = ((bf * (tf ** 3)) / 12.0 + Af * (df ** 2)) + ((tw * (hw ** 3)) / 12.0 + Aw * (dw ** 2))
            iy0 = (tf * (bf ** 3)) / 12.0 + (hw * (tw ** 3)) / 12.0
            ix0Formula = f"∑(I_i0+A·d²) = [({bf:.1f}·{tf:.1f}³)/12+{Af:.1f}·{df:.1f}²]+[({tw:.1f}·{hw:.1f}³)/12+{Aw:.1f}·{dw:.1f}²]"
            iy0Formula = f"[tf·bf³+hw·tw³]/12 = [{tf:.1f}·{bf:.1f}³+{hw:.1f}·{tw:.1f}³]/12"
            
        elif t == 'hollowrect':
            b = float(shape['width'])
            h = float(shape['height'])
            th = float(shape.get('thickness', 6.0))
            bi = max(1.0, b - 2.0 * th)
            hi = max(1.0, h - 2.0 * th)
            
            area = b * h - bi * hi
            ix0 = (b * (h ** 3)) / 12.0 - (bi * (hi ** 3)) / 12.0
            iy0 = (h * (b ** 3)) / 12.0 - (hi * (bi ** 3)) / 12.0
            ix0Formula = f"(b·h³-bi·hi³)/12 = ({b:.1f}·{h:.1f}³-{bi:.1f}·{hi:.1f}³)/12"
            iy0Formula = f"(h·b³-hi·bi³)/12 = ({h:.1f}·{b:.1f}³-{hi:.1f}·{bi:.1f}³)/12"
            
        elif t == 'hollowcircle':
            R = float(shape['radius'])
            th = float(shape.get('thickness', 6.0))
            r = max(1.0, R - th)
            
            area = math.pi * (R**2 - r**2)
            ix0 = (math.pi * (R**4 - r**4)) / 4.0
            iy0 = ix0
            ix0Formula = f"π(R⁴-r⁴)/4 = π({R:.1f}⁴-{r:.1f}⁴)/4"
            iy0Formula = f"π(R⁴-r⁴)/4 = π({R:.1f}⁴-{r:.1f}⁴)/4"
            
        signedArea = sign * area
        signedIx0 = sign * ix0
        signedIy0 = sign * iy0
        
        totalArea += signedArea
        sumAx += signedArea * shape['cx']
        sumAy += signedArea * shape['cy']
        
        rows.append({
            'id': shape['id'],
            'name': shape['name'],
            'type': shape['type'],
            'isHole': shape.get('isHole', False),
            'area': signedArea,
            'cx': shape['cx'],
            'cy': shape['cy'],
            'ix0': signedIx0,
            'iy0': signedIy0,
            'ix0Formula': ix0Formula,
            'iy0Formula': iy0Formula,
            'dx': 0.0,
            'dy': 0.0,
            'adx2': 0.0,
            'ady2': 0.0,
            'ixTotal': 0.0,
            'iyTotal': 0.0
        })
        
    xBar = sumAx / totalArea if totalArea != 0 else 0.0
    yBar = sumAy / totalArea if totalArea != 0 else 0.0
    
    formula_parts = []
    for s in shapes:
        sign_char = '-' if s.get('isHole', False) else '+'
        tp = s['type']
        if tp == 'rectangle':
            formula_parts.append(f"{sign_char}({s['width']:.1f}×{s['height']:.1f})")
        elif tp == 'circle':
            formula_parts.append(f"{sign_char}(π×{s['radius']:.1f}²)")
        elif tp == 'ibeam':
            formula_parts.append(f"{sign_char}(IBeam)")
        elif tp == 'tsection':
            formula_parts.append(f"{sign_char}(TSection)")
        elif tp == 'hollowrect':
            formula_parts.append(f"{sign_char}(HollowBox)")
        elif tp == 'hollowcircle':
            formula_parts.append(f"{sign_char}(HollowPipe)")
        else:
            formula_parts.append(f"{sign_char}A")
            
    totalAreaFormula = " ".join(formula_parts)
    # Strip leading plus
    if totalAreaFormula.startswith('+'):
        totalAreaFormula = totalAreaFormula[1:]
        
    xBarFormula = f"X_G = \\frac{{\\sum (A_i \\cdot cx_i)}}{{\\sum A_i}} = \\frac{{{sumAx:.1f}}}{{{totalArea:.1f}}}"
    yBarFormula = f"Y_G = \\frac{{\\sum (A_i \\cdot cy_i)}}{{\\sum A_i}} = \\frac{{{sumAy:.1f}}}{{{totalArea:.1f}}}"
    
    centroid_result = {
        'x': xBar,
        'y': yBar,
        'totalArea': totalArea,
        'steps': {
            'totalAreaFormula': totalAreaFormula if totalAreaFormula else "0.0",
            'totalAreaVal': totalArea,
            'sumAx': sumAx,
            'sumAy': sumAy,
            'xBarFormula': xBarFormula,
            'yBarFormula': yBarFormula
        }
    }
    
    totalIx = 0.0
    totalIy = 0.0
    
    updated_rows = []
    for row in rows:
        sign = -1.0 if row['isHole'] else 1.0
        # dx is horizontal offset from cx to xBar (used in Iy)
        # dy is vertical offset from cy to yBar (used in Ix)
        # Note standard PAT rules: Ix_total = Ix0 + Area * dy^2  --  Iy_total = Iy0 + Area * dx^2
        dx = row['cx'] - xBar
        dy = row['cy'] - yBar
        
        ady2 = sign * abs(row['area']) * (dy ** 2)
        adx2 = sign * abs(row['area']) * (dx ** 2)
        
        ixTotal = row['ix0'] + ady2
        iyTotal = row['iy0'] + adx2
        
        totalIx += ixTotal
        totalIy += iyTotal
        
        # we label offset distance:
        row['dx'] = dx
        row['dy'] = dy
        row['adx2'] = adx2 # term relative to Y axis offset, added to Iy
        row['ady2'] = ady2 # term relative to X axis offset, added to Ix
        row['ixTotal'] = ixTotal
        row['iyTotal'] = iyTotal
        updated_rows.append(row)
        
    rx = math.sqrt(totalIx / totalArea) if (totalIx > 0 and totalArea > 0) else 0.0
    ry = math.sqrt(totalIy / totalArea) if (totalIy > 0 and totalArea > 0) else 0.0
    
    return {
        "centroid": centroid_result,
        "rows": updated_rows,
        "totalIx": totalIx,
        "totalIy": totalIy,
        "rx": rx,
        "ry": ry
    }

# ----------------- COORDINATE VISUALIZER BOUNDS -----------------
def calculate_bounds(shapes, x_bar, y_bar):
    if not shapes:
        return {"minX": -50.0, "maxX": 50.0, "minY": -50.0, "maxY": 50.0}
    
    minX = float('inf')
    maxX = float('-inf')
    minY = float('inf')
    maxY = float('-inf')
    
    for shape in shapes:
        t = shape['type']
        cx = shape['cx']
        cy = shape['cy']
        
        if t in ('rectangle', 'hollowrect'):
            halfW = shape['width'] / 2.0
            halfH = shape['height'] / 2.0
            minX = min(minX, cx - halfW)
            maxX = max(maxX, cx + halfW)
            minY = min(minY, cy - halfH)
            maxY = max(maxY, cy + halfH)
        elif t in ('circle', 'hollowcircle'):
            r = shape['radius']
            minX = min(minX, cx - r)
            maxX = max(maxX, cx + r)
            minY = min(minY, cy - r)
            maxY = max(maxY, cy + r)
        elif t in ('ibeam', 'tsection'):
            halfW = shape.get('fWidth', 80.0) / 2.0
            halfH = shape['height'] / 2.0
            minX = min(minX, cx - halfW)
            maxX = max(maxX, cx + halfW)
            minY = min(minY, cy - halfH)
            maxY = max(maxY, cy + halfH)
            
    minX = min(minX, x_bar)
    maxX = max(maxX, x_bar)
    minY = min(minY, y_bar)
    maxY = max(maxY, y_bar)
    
    if minX == maxX:
        minX -= 10.0
        maxX += 10.0
    if minY == maxY:
        minY -= 10.0
        maxY += 10.0
        
    dx = maxX - minX
    dy = maxY - minY
    minX -= dx * 0.18
    maxX += dx * 0.18
    minY -= dy * 0.18
    maxY += dy * 0.18
    
    return {"minX": minX, "maxX": maxX, "minY": minY, "maxY": maxY}

# ----------------- VECTOR SVG ENERGETICAL DRAWER -----------------
def generate_interactive_svg(shapes, centroid_res, bounds):
    canvasWidth = 400
    canvasHeight = 400
    padding = 40
    
    x_bar = centroid_res['x']
    y_bar = centroid_res['y']
    
    physW = bounds['maxX'] - bounds['minX']
    physH = bounds['maxY'] - bounds['minY']
    
    scaleX = (canvasWidth - padding * 2) / physW if physW > 0 else 1.0
    scaleY = (canvasHeight - padding * 2) / physH if physH > 0 else 1.0
    scale = min(scaleX, scaleY)
    
    physCx = (bounds['minX'] + bounds['maxX']) / 2.0
    physCy = (bounds['minY'] + bounds['maxY']) / 2.0
    
    svgCx = canvasWidth / 2.0
    svgCy = canvasHeight / 2.0
    
    def toSvgX(x):
        return svgCx + (x - physCx) * scale
        
    def toSvgY(y):
        return svgCy - (y - physCy) * scale
        
    def toSvgDist(d):
        return d * scale

    rangeX = bounds['maxX'] - bounds['minX']
    if rangeX > 500: step = 100
    elif rangeX > 250: step = 50
    elif rangeX > 100: step = 20
    elif rangeX > 40: step = 10
    elif rangeX > 15: step = 5
    else: step = 2
    
    xStart = math.floor(bounds['minX'] / step) * step
    xEnd = math.ceil(bounds['maxX'] / step) * step
    yStart = math.floor(bounds['minY'] / step) * step
    yEnd = math.ceil(bounds['maxY'] / step) * step
    
    vLines = []
    x_curr = xStart
    while x_curr <= xEnd:
        vLines.append(x_curr)
        x_curr += step
        
    hLines = []
    y_curr = yStart
    while y_curr <= yEnd:
        hLines.append(y_curr)
        y_curr += step

    svg = []
    svg.append(f'<svg width="100%" height="100%" viewBox="0 0 {canvasWidth} {canvasHeight}" style="background-color: #030712; border: 1px solid #1f2937; border-radius: 12px; font-family: system-ui, sans-serif;">')
    
    # Hatch pattern definitions for voids
    svg.append('''
    <defs>
      <pattern id="diagonalHatch" width="10" height="10" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="10" stroke="#f43f5e" stroke-width="2.5" stroke-opacity="0.6" />
      </pattern>
    </defs>
    ''')
    
    # 1. Coordinate Grid Lines
    svg.append('<g stroke="#1e293b" stroke-width="0.8" stroke-dasharray="2,4">')
    for x in vLines:
        svg.append(f'<line x1="{toSvgX(x)}" y1="0" x2="{toSvgX(x)}" y2="{canvasHeight}" />')
    for y in hLines:
        svg.append(f'<line x1="0" y1="{toSvgY(y)}" x2="{canvasWidth}" y2="{toSvgY(y)}" />')
    svg.append('</g>')
    
    # 2. X and Y Coordinate Numbers
    svg.append('<g fill="#475569" font-size="9" font-family="monospace" font-weight="bold">')
    for x in vLines:
        yPos = toSvgY(0)
        safeY = max(11.0, min(float(canvasHeight - 6), yPos + 12.0))
        svg.append(f'<text x="{toSvgX(x)}" y="{safeY}" text-anchor="middle" opacity="0.8">{int(x) if x == int(x) else round(x, 1)}</text>')
    for y in hLines:
        xPos = toSvgX(0)
        safeX = max(6.0, min(float(canvasWidth - 14), xPos - 8.0))
        svg.append(f'<text x="{safeX}" y="{toSvgY(y)+3}" text-anchor="end" opacity="0.8">{int(y) if y == int(y) else round(y, 1)}</text>')
    svg.append('</g>')
    
    # 3. Principal Reference Axes (0,0)
    svg.append('<g stroke="#334155" stroke-width="1.2" opacity="0.75">')
    svg.append(f'<line x1="0" y1="{toSvgY(0)}" x2="{canvasWidth}" y2="{toSvgY(0)}" />')
    svg.append(f'<line x1="{toSvgX(0)}" y1="0" x2="{toSvgX(0)}" y2="{canvasHeight}" />')
    svg.append('</g>')
    
    # 4. Draw geometry shape blocks (with sequences coloring)
    for i, shape in enumerate(shapes):
        x = toSvgX(shape['cx'])
        y = toSvgY(shape['cy'])
        t = shape['type']
        isHole = shape.get('isHole', False)
        
        # Color palettes matching composite layers
        fill = "url(#diagonalHatch)" if isHole else "#10b981" if i == 0 else "#3b82f6" if i == 1 else "#8b5cf6" if i == 2 else "#ec4899"
        fill_opacity = "1.0" if isHole else "0.22"
        stroke = "#f43f5e" if isHole else "#059669" if i == 0 else "#2563eb" if i == 1 else "#7c3aed" if i == 2 else "#db2777"
        stroke_dash = "4,3" if isHole else "0"
        
        if t == 'rectangle':
            w_s = toSvgDist(shape['width'])
            h_s = toSvgDist(shape['height'])
            svg.append(f'<rect x="{x - w_s/2}" y="{y - h_s/2}" width="{w_s}" height="{h_s}" rx="2" fill="{fill}" fill-opacity="{fill_opacity}" stroke="{stroke}" stroke-width="2.0" stroke-dasharray="{stroke_dash}" />')
            
        elif t == 'circle':
            r_s = toSvgDist(shape['radius'])
            svg.append(f'<circle cx="{x}" cy="{y}" r="{r_s}" fill="{fill}" fill-opacity="{fill_opacity}" stroke="{stroke}" stroke-width="2.0" stroke-dasharray="{stroke_dash}" />')
            
        elif t == 'ibeam':
            bf = shape.get('fWidth', 80.0)
            h = shape['height']
            tf = shape.get('fThickness', 15.0)
            tw = shape.get('wThickness', 12.0)
            
            bf_s = toSvgDist(bf)
            h_s = toSvgDist(h)
            tf_s = toSvgDist(tf)
            tw_s = toSvgDist(tw)
            
            path_d = f"M {x - bf_s / 2} {y - h_s / 2} H {x + bf_s / 2} V {y - h_s / 2 + tf_s} H {x + tw_s / 2} V {y + h_s / 2 - tf_s} H {x + bf_s / 2} V {y + h_s / 2} H {x - bf_s / 2} V {y + h_s / 2 - tf_s} H {x - tw_s / 2} V {y - h_s / 2 + tf_s} H {x - bf_s / 2} Z"
            svg.append(f'<path d="{path_d}" fill="{fill}" fill-opacity="{fill_opacity}" stroke="{stroke}" stroke-width="2.0" stroke-dasharray="{stroke_dash}" />')
            
        elif t == 'tsection':
            bf = shape.get('fWidth', 90.0)
            h = shape['height']
            tf = shape.get('fThickness', 16.0)
            tw = shape.get('wThickness', 16.0)
            hw = max(1.0, h - tf)
            
            Af = bf * tf
            Aw = tw * hw
            yBase = (Aw * (hw / 2.0) + Af * (hw + tf / 2.0)) / (Af + Aw) if (Af + Aw) > 0 else 0
            
            bf_s = toSvgDist(bf)
            h_s = toSvgDist(h)
            tf_s = toSvgDist(tf)
            tw_s = toSvgDist(tw)
            hw_s = toSvgDist(hw)
            yBase_s = toSvgDist(yBase)
            
            path_d = f"M {x - bf_s / 2} {y - (h_s - yBase_s)} H {x + bf_s / 2} V {y - (hw_s - yBase_s)} H {x + tw_s / 2} V {y + yBase_s} H {x - tw_s / 2} V {y - (hw_s - yBase_s)} H {x - bf_s / 2} Z"
            svg.append(f'<path d="{path_d}" fill="{fill}" fill-opacity="{fill_opacity}" stroke="{stroke}" stroke-width="2.0" stroke-dasharray="{stroke_dash}" />')
            
        elif t == 'hollowrect':
            b = shape['width']
            h = shape['height']
            th = shape.get('thickness', 6.0)
            bi = max(1.0, b - 2.0 * th)
            hi = max(1.0, h - 2.0 * th)
            
            b_s = toSvgDist(b)
            h_s = toSvgDist(h)
            bi_s = toSvgDist(bi)
            hi_s = toSvgDist(hi)
            
            path_d = f"M {x - b_s / 2} {y - h_s / 2} h {b_s} v {h_s} h {-b_s} Z M {x - bi_s / 2} {y - hi_s / 2} h {bi_s} v {hi_s} h {-bi_s} Z"
            svg.append(f'<path d="{path_d}" fill="{fill}" fill-opacity="{fill_opacity}" stroke="{stroke}" stroke-width="2.0" fill-rule="evenodd" stroke-dasharray="{stroke_dash}" />')
            
        elif t == 'hollowcircle':
            R = shape['radius']
            th = shape.get('thickness', 6.0)
            r = max(1.0, R - th)
            
            R_s = toSvgDist(R)
            r_s = toSvgDist(r)
            
            path_d = f"M {x} {y - R_s} A {R_s} {R_s} 0 1 0 {x} {y + R_s} A {R_s} {R_s} 0 1 0 {x} {y - R_s} Z M {x} {y - r_s} A {r_s} {r_s} 0 1 1 {x} {y + r_s} A {r_s} {r_s} 0 1 1 {x} {y - r_s} Z"
            svg.append(f'<path d="{path_d}" fill="{fill}" fill-opacity="{fill_opacity}" stroke="{stroke}" stroke-width="2.0" fill-rule="evenodd" stroke-dasharray="{stroke_dash}" />')

        # Tag local subshape sequence
        svg.append(f'<circle cx="{x}" cy="{y}" r="2" fill="#94a3b8" />')
        svg.append(f'<text x="{x + 6}" y="{y - 5}" fill="#94a3b8" font-size="9" font-family="monospace">#{i+1}</text>')

    # 5. Global Neutral Axes (dashed gold paths)
    svg.append('<g stroke="#f59e0b" stroke-width="1.5" stroke-dasharray="3,3" opacity="0.85">')
    # Horizontal line through global yBar
    svg.append(f'<line x1="0" y1="{toSvgY(y_bar)}" x2="{canvasWidth}" y2="{toSvgY(y_bar)}" />')
    # Vertical line through global xBar
    svg.append(f'<line x1="{toSvgX(x_bar)}" y1="0" x2="{toSvgX(x_bar)}" y2="{canvasHeight}" />')
    svg.append('</g>')

    # 6. Distinctive Centroid Icon (+ standard)
    cx_s = toSvgX(x_bar)
    cy_s = toSvgY(y_bar)
    svg.append(f'<g stroke="#f59e0b" stroke-width="2.5">')
    svg.append(f'<line x1="{cx_s - 9}" y1="{cy_s}" x2="{cx_s + 9}" y2="{cy_s}" />')
    svg.append(f'<line x1="{cx_s}" y1="{cy_s - 9}" x2="{cx_s}" y2="{cy_s + 9}" />')
    svg.append('</g>')
    svg.append(f'<circle cx="{cx_s}" cy="{cy_s}" r="3" fill="#f59e0b" stroke="#ffffff" stroke-width="1" />')
    
    # Legend scale text
    svg.append(f'<text x="12" y="380" fill="#64748b" font-size="10" font-family="monospace" font-weight="bold">Scale: 1px = {1.0/scale:.2f} mm</text>')
    
    svg.append('</svg>')
    return "".join(svg)


# ----------------- SIDEBAR CONTROLS & SELECTION -----------------
with st.sidebar:
    # 1. Dual language dropdown
    lang_sel = st.selectbox(
        "Language / 語言", 
        ["English", "繁體中文"], 
        index=0
    )
    vocab = L[lang_sel]
    
    st.markdown("---")
    
    # 2. Section preset selection
    st.subheader(vocab["preset_sec"])
    presets_data = get_presets_data()
    
    preset_opt_keys = list(presets_data.keys())
    preset_opt_labels = [
        presets_data[k]["nameEn"] if lang_sel == "English" else presets_data[k]["nameZh"]
        for k in preset_opt_keys
    ]
    
    # Append a manual option
    preset_opt_keys.append("custom")
    preset_opt_labels.append(vocab["custom_label"])
    
    preset_sel = st.selectbox(
        vocab["preset_label"],
        options=preset_opt_keys,
        format_func=lambda x: vocab["custom_label"] if x == "custom" else (presets_data[x]["nameEn"] if lang_sel == "English" else presets_data[x]["nameZh"]),
        index=2 # default to I-Beam
    )
    
    # Check if selected preset changed. If so, reset shape state
    if preset_sel != st.session_state.prev_preset_sel:
        if preset_sel != "custom":
            st.session_state.shapes = [dict(s) for s in presets_data[preset_sel]["shapes"]]
            st.sidebar.success(vocab["preset_loaded"].format(
                presets_data[preset_sel]["nameEn"] if lang_sel == "English" else presets_data[preset_sel]["nameZh"]
            ))
        st.session_state.prev_preset_sel = preset_sel

    # Display preset descriptive info
    if preset_sel != "custom":
        st.caption(
            presets_data[preset_sel]["descEn"] if lang_sel == "English" else presets_data[preset_sel]["descZh"]
        )
        
    st.markdown("---")
    
    # 3. Quick-Add customized geometries button
    st.subheader(vocab["add_shape_sec"])
    add_type = st.selectbox(
        vocab["add_shape_lbl"],
        options=["rectangle", "circle", "ibeam", "tsection", "hollowrect", "hollowcircle"],
        format_func=lambda t: {
            "rectangle": "Rectangle" if lang_sel == "English" else "矩形元件",
            "circle": "Circle" if lang_sel == "English" else "圓形元件",
            "ibeam": "I-Beam" if lang_sel == "English" else "工字型元件 (I-Section)",
            "tsection": "T-Section" if lang_sel == "English" else "T型截面元件",
            "hollowrect": "Hollow Box" if lang_sel == "English" else "中空箱型管",
            "hollowcircle": "Hollow Pipe" if lang_sel == "English" else "中空圓管件"
        }[t]
    )
    
    if st.button(vocab["add_btn_text"], use_container_width=True):
        new_id = str(uuid.uuid4())[:8]
        new_shape = {
            "id": f"shape_{new_id}",
            "name": f"Block #{len(st.session_state.shapes) + 1}",
            "type": add_type,
            "width": 60.0 if add_type in ("rectangle", "hollowrect") else 0.0,
            "height": 60.0 if add_type in ("rectangle", "ibeam", "tsection", "hollowrect") else 0.0,
            "radius": 30.0 if add_type in ("circle", "hollowcircle") else 0.0,
            "cx": 0.0,
            "cy": 0.0,
            "isHole": False,
            "fWidth": 70.0 if add_type in ("ibeam", "tsection") else 0.0,
            "fThickness": 12.0 if add_type in ("ibeam", "tsection") else 0.0,
            "wThickness": 10.0 if add_type in ("ibeam", "tsection") else 0.0,
            "thickness": 5.0 if add_type in ("hollowrect", "hollowcircle") else 0.0
        }
        st.session_state.shapes.append(new_shape)
        st.session_state.prev_preset_sel = "custom" # Shift to custom category automatically
        st.rerun()

# ----------------- MAIN DISPLAY SCREEN Layout -----------------
st.title(vocab["title"])
st.caption(vocab["sub"])

# Calculate engine active values
res = calculate_section_properties(st.session_state.shapes)
xBar = res["centroid"]["x"]
yBar = res["centroid"]["y"]

col_editor, col_visual = st.columns([13, 11], gap="medium")

# --------------- COLUMN 1: INTERACTIVE STRUCTURE EDITOR ---------------
with col_editor:
    st.subheader(vocab["shape_list_sec"])
    
    if not st.session_state.shapes:
        st.info(vocab["empty_warning"])
    else:
        # Loop over shapes to render controls
        for index, shape in enumerate(st.session_state.shapes):
            s_id = shape["id"]
            title_name = f"#{index + 1}: {shape['name']} ({shape['type'].upper()})"
            is_hole = shape.get("isHole", False)
            
            # Show customized header reflecting void states
            label_state = f" 🔴 [VOID]" if is_hole else " 🟢 [SOLID]"
            expander_title = f"{title_name}{label_state}"
            
            with st.expander(expander_title, expanded=(index == len(st.session_state.shapes) - 1)):
                # Row 1: Label and Solid vs Hollow
                c1, c2 = st.columns([3, 3])
                with c1:
                    sh_name = st.text_input(
                        vocab["name_lbl"],
                        value=shape["name"],
                        key=f"name_{s_id}"
                    )
                    st.session_state.shapes[index]["name"] = sh_name
                with c2:
                    is_h_val = st.selectbox(
                        vocab["is_hole_lbl"],
                        options=[False, True],
                        format_func=lambda x: vocab["hole_opt"] if x else vocab["solid_opt"],
                        index=1 if is_hole else 0,
                        key=f"is_hole_sel_{s_id}"
                    )
                    st.session_state.shapes[index]["isHole"] = is_h_val
                
                # Row 2: Center coordinate alignment
                st.markdown(f"**{vocab['pos_sec']}**")
                cx1, cx2 = st.columns([3, 3])
                with cx1:
                    sh_cx = st.number_input(
                        vocab["cx_lbl"],
                        value=float(shape["cx"]),
                        step=5.0,
                        key=f"cx_{s_id}"
                    )
                    st.session_state.shapes[index]["cx"] = sh_cx
                with cx2:
                    sh_cy = st.number_input(
                        vocab["cy_lbl"],
                        value=float(shape["cy"]),
                        step=5.0,
                        key=f"cy_{s_id}"
                    )
                    st.session_state.shapes[index]["cy"] = sh_cy
                
                # Row 3: Advanced dimension variables
                st.markdown(f"**{vocab['dim_sec']}**")
                t = shape["type"]
                
                if t == "rectangle":
                    d1, d2 = st.columns([3, 3])
                    with d1:
                        w_v = st.number_input(
                            vocab["b_mm"], value=float(shape["width"]), min_value=1.0, step=1.0, key=f"wid_{s_id}"
                        )
                        st.session_state.shapes[index]["width"] = w_v
                    with d2:
                        h_v = st.number_input(
                            vocab["h_mm"], value=float(shape["height"]), min_value=1.0, step=1.0, key=f"hei_{s_id}"
                        )
                        st.session_state.shapes[index]["height"] = h_v
                        
                elif t == "circle":
                    r_v = st.number_input(
                        vocab["r_mm"], value=float(shape["radius"]), min_value=1.0, step=1.0, key=f"rad_{s_id}"
                    )
                    st.session_state.shapes[index]["radius"] = r_v
                    
                elif t in ("ibeam", "tsection"):
                    d1, d2 = st.columns([3, 3])
                    with d1:
                        h_v = st.number_input(
                            vocab["h_mm"], value=float(shape["height"]), min_value=1.0, step=1.0, key=f"ibe_h_{s_id}"
                        )
                        st.session_state.shapes[index]["height"] = h_v
                    with d2:
                        bf_v = st.number_input(
                            vocab["bf_mm"], value=float(shape.get("fWidth", 80.0)), min_value=1.0, step=1.0, key=f"ibe_bf_{s_id}"
                        )
                        st.session_state.shapes[index]["fWidth"] = bf_v
                        
                    d3, d4 = st.columns([3, 3])
                    with d3:
                        tf_v = st.number_input(
                            vocab["tf_mm"], value=float(shape.get("fThickness", 12.0)), min_value=1.0, step=1.0, key=f"ibe_tf_{s_id}"
                        )
                        st.session_state.shapes[index]["fThickness"] = tf_v
                    with d4:
                        tw_v = st.number_input(
                            vocab["tw_mm"], value=float(shape.get("wThickness", 10.0)), min_value=1.0, step=1.0, key=f"ibe_tw_{s_id}"
                        )
                        st.session_state.shapes[index]["wThickness"] = tw_v
                        
                elif t == "hollowrect":
                    d1, d2 = st.columns([3, 3])
                    with d1:
                        w_v = st.number_input(
                            vocab["b_mm"], value=float(shape["width"]), min_value=1.0, step=1.0, key=f"hol_w_{s_id}"
                        )
                        st.session_state.shapes[index]["width"] = w_v
                    with d2:
                        h_v = st.number_input(
                            vocab["h_mm"], value=float(shape["height"]), min_value=1.0, step=1.0, key=f"hol_h_{s_id}"
                        )
                        st.session_state.shapes[index]["height"] = h_v
                        
                    th_v = st.number_input(
                        vocab["t_mm"], value=float(shape.get("thickness", 6.0)), min_value=0.5, step=1.0, key=f"hol_t_{s_id}"
                    )
                    st.session_state.shapes[index]["thickness"] = th_v
                    
                elif t == "hollowcircle":
                    d1, d2 = st.columns([3, 3])
                    with d1:
                        R_v = st.number_input(
                            vocab["R_mm"], value=float(shape["radius"]), min_value=1.0, step=1.0, key=f"hc_R_{s_id}"
                        )
                        st.session_state.shapes[index]["radius"] = R_v
                    with d2:
                        th_v = st.number_input(
                            vocab["t_mm"], value=float(shape.get("thickness", 6.0)), min_value=0.5, step=1.0, key=f"hc_t_{s_id}"
                        )
                        st.session_state.shapes[index]["thickness"] = th_v
                
                # Delete element control
                st.markdown("<br>", unsafe_allow_html=True)
                if st.button(f"🗑️ {vocab['delete']} ({shape['name']})", key=f"del_{s_id}", use_container_width=True):
                    st.session_state.shapes.pop(index)
                    st.session_state.prev_preset_sel = "custom"
                    st.rerun()

# --------------- COLUMN 2: VECTOR CANVAS SHOWCASE & PLOTTER ---------------
with col_visual:
    st.subheader(vocab["canvas_title"])
    st.caption(vocab["scale_desc"])
    
    # Live vector SVG compiling
    bounds = calculate_bounds(st.session_state.shapes, xBar, yBar)
    svg_canvas_code = generate_interactive_svg(st.session_state.shapes, res, bounds)
    
    # HTML component rendering insideStreamlit preserving margins
    import streamlit.components.v1 as components
    components.html(svg_canvas_code, height=415, scrolling=False)
    
    st.markdown(f"<p style='color:#64748b; font-size:11px; font-style:italic; line-height:1.2; text-align:center;'>{vocab['theory_text']}</p>", unsafe_allow_html=True)


# ==============================================================================
#                 COMPREHENSIVE TAB DATA ANALYSIS & METRICS
# ==============================================================================
st.markdown("---")

# Tab definition
tab_summary, tab_centroid, tab_pat = st.tabs([
    vocab["tab_summary"], 
    vocab["tab_centroid_steps"], 
    vocab["tab_pat_steps"]
])

# ----------------- TAB A: RESULT SUMMARY -----------------
with tab_summary:
    # 2x3 Metric Cards Grid
    grid_r1_c1, grid_r1_c2, grid_r1_c3 = st.columns([1, 1, 1])
    grid_r2_c1, grid_r2_c2, grid_r2_c3 = st.columns([1, 1, 1])
    
    with grid_r1_c1:
        st.markdown(f"""
        <div class="metric-card" style="border-left-color: #10b981;">
            <div class="metric-title">{vocab["total_area"]} (A)</div>
            <div class="metric-value">{res["centroid"]["totalArea"]:,.1f}<span class="metric-unit">mm²</span></div>
        </div>
        """, unsafe_allow_html=True)
        
    with grid_r1_c2:
        st.markdown(f"""
        <div class="metric-card" style="border-left-color: #3b82f6;">
            <div class="metric-title">{vocab["ix_lbl"]} (Ix)</div>
            <div class="metric-value">{res["totalIx"]:,.1f}<span class="metric-unit">mm⁴</span></div>
        </div>
        """, unsafe_allow_html=True)
        
    with grid_r1_c3:
        st.markdown(f"""
        <div class="metric-card" style="border-left-color: #a855f7;">
            <div class="metric-title">{vocab["rx_lbl"]} (rx)</div>
            <div class="metric-value">{res["rx"]:.2f}<span class="metric-unit">mm</span></div>
        </div>
        """, unsafe_allow_html=True)
        
    with grid_r2_c1:
        st.markdown(f"""
        <div class="metric-card" style="border-left-color: #f59e0b;">
            <div class="metric-title">{vocab["centroid_u"]}</div>
            <div class="metric-value">({xBar:.2f}, {yBar:.2f})<span class="metric-unit">mm</span></div>
        </div>
        """, unsafe_allow_html=True)
        
    with grid_r2_c2:
        st.markdown(f"""
        <div class="metric-card" style="border-left-color: #ec4899;">
            <div class="metric-title">{vocab["iy_lbl"]} (Iy)</div>
            <div class="metric-value">{res["totalIy"]:,.1f}<span class="metric-unit">mm⁴</span></div>
        </div>
        """, unsafe_allow_html=True)
        
    with grid_r2_c3:
        st.markdown(f"""
        <div class="metric-card" style="border-left-color: #14b8a6;">
            <div class="metric-title">{vocab["ry_lbl"]} (ry)</div>
            <div class="metric-value">{res["ry"]:.2f}<span class="metric-unit">mm</span></div>
        </div>
        """, unsafe_allow_html=True)

# ----------------- TAB B: CENTROID FORMULA STEPS (TeX Equations) -----------------
with tab_centroid:
    st.subheader(vocab["formulas_centroid"])
    st.caption(vocab["steps_desc"])
    
    st.markdown("##### 1. Summation of Areas")
    st.latex(rf"\sum A_i = {res['centroid']['steps']['totalAreaFormula']} = {res['centroid']['steps']['totalAreaVal']:,.1f} \text{{ mm}}^2")
    
    st.markdown("##### 2. First Moment of Area Sums (Weighted Displacements)")
    st.latex(rf"\sum (A_i \cdot cx_i) = {res['centroid']['steps']['sumAx']:,.1f} \text{{ mm}}^3")
    st.latex(rf"\sum (A_i \cdot cy_i) = {res['centroid']['steps']['sumAy']:,.1f} \text{{ mm}}^3")
    
    st.markdown("##### 3. Coordinate Neutral Axes location")
    st.latex(rf"{res['centroid']['steps']['xBarFormula']} \approx {xBar:.2f} \text{{ mm}}")
    st.latex(rf"{res['centroid']['steps']['yBarFormula']} \approx {yBar:.2f} \text{{ mm}}")

# ----------------- TAB C: PARALLEL AXIS MATRIX DATAFRAME -----------------
with tab_pat:
    st.subheader(vocab["formulas_moi"])
    st.caption(vocab["theory_text"])
    
    if res["rows"]:
        # Build pandas dataframe representing calculations
        data_table = []
        for index, row in enumerate(res["rows"]):
            lbl = f"#{index + 1}: {row['name']}"
            data_table.append({
                vocab["table_shape"]: lbl,
                "Type": row["type"].upper(),
                "Hole?": "Yes" if row["isHole"] else "No",
                vocab["table_area"]: f"{row['area']:,.1f}",
                vocab["table_cx"]: f"{row['cx']:.1f}",
                vocab["table_cy"]: f"{row['cy']:.1f}",
                "Local Ix0": f"{row['ix0']:,.1f}",
                "Local Iy0": f"{row['iy0']:,.1f}",
                "dy_i (Y-dist)": f"{row['dy']:.1f}",
                "dx_i (X-dist)": f"{row['dx']:.1f}",
                "A·dy² (Inertia Ix)": f"{row['ady2']:,.1f}",
                "A·dx² (Inertia Iy)": f"{row['adx2']:,.1f}",
                "Row Ix_tot": f"{row['ixTotal']:,.1f}",
                "Row Iy_tot": f"{row['iyTotal']:,.1f}",
            })
            
        df = pd.DataFrame(data_table)
        st.dataframe(df, use_container_width=True, hide_index=True)
        
        # Final combined mathematical sum display with LaTeX
        st.markdown("**Combined Final Mechanical Integrations:**")
        st.latex(rf"I_x = \sum (I_{{x0}} + A \cdot dy^2) = {res['totalIx']:,.1f} \text{{ mm}}^4")
        st.latex(rf"I_y = \sum (I_{{y0}} + A \cdot dx^2) = {res['totalIy']:,.1f} \text{{ mm}}^4")
    else:
        st.write("---")
