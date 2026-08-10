import re

html_path = r'C:\Users\LADYMARY\Documents\PROYECTO - SENA\APLICATIVO\GESTIVAPYME\frontend\src\app\pages\dashboard\proveedores\proveedores.html'

with open(html_path, 'r', encoding='utf-8') as f:
    html = f.read()

# Replace inline styles and update classes
replacements = [
    (r'class="action-bar" style="display: flex; justify-content: space-between; margin-bottom: 1rem;"', r'class="action-bar flex justify-between mb-4"'),
    (r'class="search-input input-neumorphic" \s*style="width: 300px;"', r'class="search-input input-neumorphic w-[300px]"'),
    (r'class="btn-add"', r'class="btn-primary"'),
    (r'style="padding: 2rem; text-align: center; color: #94a3b8;"', r'class="p-8 text-center text-slate-400"'),
    (r'style="font-size: 0.8rem; color: #94a3b8;"', r'class="text-xs text-slate-400"'),
    (r'style="font-size: 0.8rem;"', r'class="text-xs"'),
    (r'style="display: flex; gap: 0.5rem;"', r'class="flex gap-2"'),
    (r'style="display: flex; gap: 1.5rem; margin-bottom: 2rem;"', r'class="flex gap-6 mb-8"'),
    (r'class="glass-panel" style="padding: 1.5rem; border-bottom: 4px solid #ef4444; flex: 1;"', r'class="glass-panel p-6 border-b-4 border-red-500 flex-1"'),
    (r'style="margin-top: 0; color: #94a3b8; font-size: 0.9rem; text-transform: uppercase;"', r'class="mt-0 text-slate-400 text-sm uppercase"'),
    (r'style="font-size: 2.5rem; font-weight: bold; color: #ef4444;"', r'class="text-4xl font-bold text-red-500"'),
    (r'style="flex: 2; padding-top: 1rem;"', r'class="flex-[2] pt-4"'),
    (r'style="color: #cbd5e1;"', r'class="text-slate-300"'),
    (r'style="text-align: center;"', r'class="text-center"'),
    (r'style="font-weight: bold;"', r'class="font-bold"'),
    (r'class="btn-save" style="padding: 0.5rem 1rem; font-size: 0.8rem;"', r'class="btn-success px-4 py-2 text-xs"'),
    (r'style="color: #10b981; font-size: 0.8rem;"', r'class="text-emerald-500 text-xs"'),
    (r'style="color: #cbd5e1; margin-bottom: 1.5rem;"', r'class="text-slate-300 mb-6"'),
    (r'style="color: #fbbf24; font-size: 1.1rem; letter-spacing: 2px;"', r'class="text-amber-400 text-lg tracking-widest"'),
    (r'style="max-width: 250px; overflow: hidden; text-overflow: ellipsis;"', r'class="max-w-[250px] overflow-hidden text-ellipsis whitespace-nowrap"'),
    (r'class="btn-general" style="background-color: #3b82f6; color: white; padding: 0.4rem 0.8rem;"', r'class="btn-primary px-3 py-1.5"'),
    (r'class="modal-content glass-panel" style="max-width: 600px;"', r'class="modal-content glass-panel max-w-[600px]"'),
    (r'style="margin: 0; color: white; text-align: center !important;"', r'class="m-0 text-white text-center"'),
    (r'style="display: flex; gap: 1rem; flex-wrap: wrap;"', r'class="flex gap-4 flex-wrap"'),
    (r'class="form-group" style="flex: 2; min-width: 200px;"', r'class="form-group flex-[2] min-w-[200px]"'),
    (r'class="form-group" style="flex: 1; min-width: 150px;"', r'class="form-group flex-1 min-w-[150px]"'),
    (r'class="form-group" style="flex: 1;"', r'class="form-group flex-1"'),
    (r'class="modal-footer" style="display: flex; justify-content: center; gap: 1rem; margin-top: 1.5rem;"', r'class="modal-footer flex justify-center gap-4 mt-6"'),
    (r'class="modal-content glass-panel" style="max-width: 450px; text-align: center;"', r'class="modal-content glass-panel max-w-[450px] text-center"'),
    (r'class="modal-header" style="justify-content: center; border-bottom: none;"', r'class="modal-header justify-center border-b-0"'),
    (r'style="font-size: 3rem; color: #10b981; margin-bottom: 1rem;"', r'class="text-5xl text-emerald-500 mb-4"'),
    (r'style="margin-top: 0; color: white;"', r'class="mt-0 text-white"'),
    (r'style="color: #cbd5e1; margin-bottom: 1rem;"', r'class="text-slate-300 mb-4"'),
    (r'style="display: flex; justify-content: center; gap: 1rem; margin-top: 2rem;"', r'class="flex justify-center gap-4 mt-8"'),
    (r'class="modal-content glass-panel" style="max-width: 500px;"', r'class="modal-content glass-panel max-w-[500px]"'),
    (r'style="text-align: center; color: #94a3b8; margin-bottom: 1.5rem;"', r'class="text-center text-slate-400 mb-6"'),
    (r'class="form-group" style="text-align: center;"', r'class="form-group text-center"'),
    (r'class="input-neumorphic" \[\(ngModel\)\]="nuevaCalificacion" min="1" max="5" style="text-align: center; font-size: 1.5rem;"', r'class="input-neumorphic text-center text-2xl" [(ngModel)]="nuevaCalificacion" min="1" max="5"'),
    (r'class="btn-save"', r'class="btn-success"')
]

for old, new_ in replacements:
    html = re.sub(old, new_, html)

with open(html_path, 'w', encoding='utf-8') as f:
    f.write(html)
