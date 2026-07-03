protected $table = 'proveedores';
public $timestamps = false;
protected $fillable = ['empresa_id', 'razon_social', 'nit', 'contacto', 'telefono', 'direccion', 'email', 'documentos_url', 'estado', 'fecha_inactivacion'];