<?php

namespace Tests\Feature;

use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ProductApiTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Helper to create a valid 1x1 PNG image file without requiring the GD extension.
     */
    private function createFakeImage(string $filename = 'image.png'): UploadedFile
    {
        $png1x1 = base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
        );

        return UploadedFile::fake()->createWithContent($filename, $png1x1);
    }

    /**
     * Test 1: Verificar disponibilidad del servicio (Health Check).
     */
    public function test_health_check_endpoint(): void
    {
        $response = $this->getJson('/api/health');

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'status',
                     'service',
                     'database',
                     'timestamp',
                 ]);
    }

    /**
     * Test 2: Listar productos correctamente.
     */
    public function test_can_list_products(): void
    {
        Product::factory()->count(3)->create();

        $response = $this->getJson('/api/products');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'count' => 3,
                 ])
                 ->assertJsonStructure([
                     'success',
                     'count',
                     'data' => [
                         '*' => [
                             'id',
                             'name',
                             'category',
                             'description',
                             'image',
                             'image_url',
                             'created_at',
                             'updated_at',
                         ],
                     ],
                 ]);
    }

    /**
     * Test 3: Creación exitosa de producto sin imagen.
     */
    public function test_can_create_product_successfully(): void
    {
        $payload = [
            'name' => 'Teclado Mecánico RGB',
            'category' => 'Periféricos',
            'description' => 'Teclado para gaming con switches mecánicos táctiles.',
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Producto registrado exitosamente.',
                     'data' => [
                         'name' => 'Teclado Mecánico RGB',
                         'category' => 'Periféricos',
                         'description' => 'Teclado para gaming con switches mecánicos táctiles.',
                         'image' => null,
                         'image_url' => null,
                     ],
                 ]);

        $this->assertDatabaseHas('products', [
            'name' => 'Teclado Mecánico RGB',
            'category' => 'Periféricos',
        ]);
    }

    /**
     * Test 4: Validación de campos obligatorios al registrar.
     */
    public function test_validates_required_fields_on_create(): void
    {
        $response = $this->postJson('/api/products', []);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Errores de validación en la solicitud.',
                 ])
                 ->assertJsonValidationErrors(['name', 'category']);
    }

    /**
     * Test 5: Consultar producto por su ID.
     */
    public function test_can_show_product_by_id(): void
    {
        $product = Product::factory()->create([
            'name' => 'Monitor 27 Pulgadas 4K',
            'category' => 'Monitores',
        ]);

        $response = $this->getJson("/api/products/{$product->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'data' => [
                         'id' => $product->id,
                         'name' => 'Monitor 27 Pulgadas 4K',
                         'category' => 'Monitores',
                     ],
                 ]);
    }

    /**
     * Test 6: Respuesta 404 para productos inexistentes.
     */
    public function test_returns_404_for_nonexistent_product(): void
    {
        $responseGet = $this->getJson('/api/products/999999');
        $responseGet->assertStatus(404)
                    ->assertJson([
                        'success' => false,
                        'message' => 'Producto no encontrado.',
                    ]);

        $responsePut = $this->putJson('/api/products/999999', ['name' => 'Nuevo']);
        $responsePut->assertStatus(404)
                    ->assertJson([
                        'success' => false,
                        'message' => 'Producto no encontrado.',
                    ]);

        $responseDelete = $this->deleteJson('/api/products/999999');
        $responseDelete->assertStatus(404)
                       ->assertJson([
                           'success' => false,
                           'message' => 'Producto no encontrado.',
                       ]);
    }

    /**
     * Test 7: Actualización de producto existente.
     */
    public function test_can_update_product(): void
    {
        $product = Product::factory()->create([
            'name' => 'Mouse Óptico',
            'category' => 'Periféricos',
            'description' => 'Mouse estándar 800 DPI.',
        ]);

        $updateData = [
            'name' => 'Mouse Óptico Gamer 16000 DPI',
            'category' => 'Periféricos Pro',
        ];

        $response = $this->putJson("/api/products/{$product->id}", $updateData);

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Producto actualizado exitosamente.',
                     'data' => [
                         'id' => $product->id,
                         'name' => 'Mouse Óptico Gamer 16000 DPI',
                         'category' => 'Periféricos Pro',
                         'description' => 'Mouse estándar 800 DPI.',
                     ],
                 ]);

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Mouse Óptico Gamer 16000 DPI',
            'category' => 'Periféricos Pro',
        ]);
    }

    /**
     * Test 8: Eliminación de producto existente.
     */
    public function test_can_delete_product(): void
    {
        $product = Product::factory()->create();

        $response = $this->deleteJson("/api/products/{$product->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Producto eliminado exitosamente.',
                 ]);

        $this->assertDatabaseMissing('products', [
            'id' => $product->id,
        ]);
    }

    /**
     * Test 9: Subida de imagen válida y generación de URL relativa.
     */
    public function test_can_upload_valid_product_image(): void
    {
        Storage::fake('public');

        $image = $this->createFakeImage('laptop.png');

        $payload = [
            'name' => 'Laptop Ultrabook 14"',
            'category' => 'Computadoras',
            'description' => 'Portátil ultraligero de alta gama.',
            'image' => $image,
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(201)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Producto registrado exitosamente.',
                 ]);

        $product = Product::where('name', 'Laptop Ultrabook 14"')->first();
        $this->assertNotNull($product);
        $this->assertNotNull($product->image);

        // Comprueba que el archivo se guardó físicamente en el disco
        Storage::disk('public')->assertExists($product->image);

        // Comprueba formato de URL relativa para proxy de Next.js (/storage/products/...)
        $this->assertStringStartsWith('/storage/products/', $product->image_url);
    }

    /**
     * Test 10: Rechazo de archivos que no sean imágenes válidas.
     */
    public function test_rejects_invalid_file_types(): void
    {
        Storage::fake('public');

        $invalidFile = UploadedFile::fake()->create('documento.pdf', 500, 'application/pdf');

        $payload = [
            'name' => 'Producto Invalido',
            'category' => 'Prueba',
            'image' => $invalidFile,
        ];

        $response = $this->postJson('/api/products', $payload);

        $response->assertStatus(422)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Errores de validación en la solicitud.',
                 ])
                 ->assertJsonValidationErrors(['image']);
    }

    /**
     * Test 11: Eliminación de imagen del disco al borrar un producto (sin archivos huérfanos).
     */
    public function test_deletes_associated_image_on_product_destroy(): void
    {
        Storage::fake('public');

        $image = $this->createFakeImage('headset.png');
        $storedPath = $image->store('products', 'public');

        $product = Product::factory()->create([
            'image' => $storedPath,
        ]);

        Storage::disk('public')->assertExists($storedPath);

        $response = $this->deleteJson("/api/products/{$product->id}");
        $response->assertStatus(200);

        // El archivo debe haber sido removido del almacenamiento
        Storage::disk('public')->assertMissing($storedPath);
        $this->assertDatabaseMissing('products', ['id' => $product->id]);
    }

    /**
     * Test 12: Reemplazo de imagen al actualizar un producto.
     */
    public function test_replaces_old_image_on_product_update(): void
    {
        Storage::fake('public');

        $oldImage = $this->createFakeImage('old.png');
        $oldPath = $oldImage->store('products', 'public');

        $product = Product::factory()->create([
            'image' => $oldPath,
        ]);

        Storage::disk('public')->assertExists($oldPath);

        $newImage = $this->createFakeImage('new.png');

        $response = $this->postJson("/api/products/{$product->id}", [
            'name' => 'Nombre Modificado',
            'image' => $newImage,
        ]);

        $response->assertStatus(200);

        $product->refresh();
        $this->assertNotEquals($oldPath, $product->image);
        Storage::disk('public')->assertMissing($oldPath);
        Storage::disk('public')->assertExists($product->image);
    }
}
