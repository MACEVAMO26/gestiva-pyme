<?php \ = \App\Models\User::with(['empresa', 'cargo', 'rol'])->where('email', 'gestivapyme@gmail.com')->first(); echo json_encode(\);
