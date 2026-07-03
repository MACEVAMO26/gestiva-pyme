public function detalles() {
    return $this->hasMany(CotizacionPedidoDetalle::class);
}