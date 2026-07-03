protected $table = 'clientes';
public $timestamps = false;
protected $fillable = ['empresa_id', 'nombres', 'apellidos', 'nombre_razon_social', 'documento', 'email', 'telefono', 'direccion', 'ciudad', 'activo', 'fecha_inactivacion'];