protected $table = 'servicios';
public $timestamps = false;
protected $fillable = ['categoria_id', 'empresa_id', 'nombre', 'descripcion', 'tarifa', 'tiempo_estimado', 'activo', 'fecha_inactivacion'];