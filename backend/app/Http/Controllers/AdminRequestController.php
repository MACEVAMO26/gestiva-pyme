<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AdminRequest;
use Illuminate\Support\Facades\Auth;

class AdminRequestController extends Controller
{
    // --- GESTIÓN DE SOLICITUDES ADMINISTRATIVAS ---
    public function index()
    {
        return response()->json(AdminRequest::with('empresa')->get());
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tipo' => 'required|string',
            'banco' => 'nullable|string',
            'comprobante' => 'nullable|file|mimes:jpeg,png,jpg,pdf|max:5120',
            'logo' => 'nullable|file|mimes:jpeg,png,jpg|max:5120',
            'documento' => 'nullable|file|mimes:pdf,jpeg,png,jpg|max:5120',
            'datos_nuevos' => 'nullable|string'
        ]);
        
        $user = Auth::user();
        $empresa_id = $user ? $user->empresa_id : null;

        $comprobantePath = null;
        if ($request->hasFile('comprobante') && $request->file('comprobante')->isValid()) {
            $uploaded = cloudinary()->uploadApi()->upload($request->file('comprobante')->getRealPath(), [
                'folder' => 'comprobantes'
            ]);
            $comprobantePath = $uploaded['secure_url'];
        }

        $datosNuevosArray = [];
        if ($request->has('datos_nuevos') && $request->input('datos_nuevos')) {
            $datosNuevosArray = json_decode($request->input('datos_nuevos'), true);
        }

        if ($request->hasFile('logo') && $request->file('logo')->isValid()) {
            $uploadedLogo = cloudinary()->uploadApi()->upload($request->file('logo')->getRealPath(), [
                'folder' => 'temp_logos'
            ]);
            $datosNuevosArray['temp_logo'] = $uploadedLogo['secure_url'];
        }

        if ($request->hasFile('documento') && $request->file('documento')->isValid()) {
            $uploadedDoc = cloudinary()->uploadApi()->upload($request->file('documento')->getRealPath(), [
                'folder' => 'temp_docs'
            ]);
            $datosNuevosArray['temp_doc'] = $uploadedDoc['secure_url'];
        }

        $req = AdminRequest::create([
            'empresa_id' => $empresa_id,
            'tipo' => $validated['tipo'],
            'estado' => 'pendiente',
            'banco' => $validated['banco'] ?? null,
            'comprobante_path' => $comprobantePath,
            'datos_nuevos' => !empty($datosNuevosArray) ? json_encode($datosNuevosArray) : null,
            'notas_propietaria' => null
        ]);

        return response()->json($req, 201);
    }

    public function process(Request $request, $id)
    {
        $req = AdminRequest::findOrFail($id);
        
        $validated = $request->validate([
            'accion' => 'required|in:aprobado,rechazado',
            'mensaje' => 'nullable|string',
            'approved_fields' => 'nullable|array'
        ]);

        $req->estado = $validated['accion'];
        $req->notas_propietaria = $validated['mensaje'] ?? null;
        
        $approvedFields = $validated['approved_fields'] ?? null;

        // Aplica automáticamente los cambios solicitados a la empresa si la solicitud es aprobada
        if ($req->estado === 'aprobado' && $req->tipo === 'cambio_datos' && $req->datos_nuevos) {
            $datos = json_decode($req->datos_nuevos, true);
            $empresa = \App\Models\Empresa::find($req->empresa_id);
            
            if ($empresa) {
                // Si no se envían approved_fields (comportamiento antiguo), asumimos todos los campos
                $fieldsToProcess = $approvedFields !== null ? $approvedFields : array_keys($datos);

                if (in_array('razon_social', $fieldsToProcess) && isset($datos['razon_social'])) $empresa->razon_social = $datos['razon_social'];
                if (in_array('nit', $fieldsToProcess) && isset($datos['nit'])) $empresa->nit = $datos['nit'];
                if (in_array('direccion', $fieldsToProcess) && isset($datos['direccion'])) $empresa->direccion = $datos['direccion'];
                if (in_array('telefono', $fieldsToProcess) && isset($datos['telefono'])) $empresa->telefono = $datos['telefono'];
                if (in_array('email', $fieldsToProcess) && isset($datos['email'])) $empresa->email = $datos['email'];
                if (in_array('color_primario', $fieldsToProcess) && isset($datos['color_primario'])) $empresa->color_primario = $datos['color_primario'];

                // Procesar Logo solo si fue aprobado
                if (in_array('temp_logo', $fieldsToProcess)) {
                    if (isset($datos['temp_logo']) && str_starts_with($datos['temp_logo'], 'http')) {
                        $empresa->logo_url = $datos['temp_logo'];
                    } else if (isset($datos['temp_logo']) && \Illuminate\Support\Facades\Storage::disk('public')->exists($datos['temp_logo'])) {
                        $newPath = str_replace('temp_logos', 'logos', $datos['temp_logo']);
                        \Illuminate\Support\Facades\Storage::disk('public')->move($datos['temp_logo'], $newPath);
                        $empresa->logo_url = '/storage/' . $newPath;
                    }
                }
                
                $empresa->save();
            }
        }

        $req->save();

        return response()->json($req);
    }

    public function misSolicitudes()
    {
        $user = Auth::user();
        if (!$user || !$user->empresa_id) {
            return response()->json([], 200);
        }
        $requests = AdminRequest::where('empresa_id', $user->empresa_id)
                    ->orderBy('created_at', 'desc')
                    ->get();
        return response()->json($requests, 200);
    }
}
