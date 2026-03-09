import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Search, AlertCircle, MoreHorizontal, Package } from 'lucide-react';
import { Table, Button, Form, Modal, InputGroup, Card, Dropdown, Spinner, Row, Col, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface Product {
    id: string;
    name: string;
    description?: string;
    price: number;
    stock: number;
    sku?: string;
    category?: string;
    isPublic: boolean;
}

const Products: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState({
        name: '',
        name_en: '',
        name_pt: '',
        name_uk: '',
        description: '',
        description_en: '',
        description_pt: '',
        description_uk: '',
        price: 0,
        stock: 0,
        sku: '',
        category: '',
        isPublic: true
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const response = await api.get('/products');
            setProducts(response.data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setFormData({
            name: product.name,
            name_en: (product as any).name_en || '',
            name_pt: (product as any).name_pt || '',
            name_uk: (product as any).name_uk || '',
            description: product.description || '',
            description_en: (product as any).description_en || '',
            description_pt: (product as any).description_pt || '',
            description_uk: (product as any).description_uk || '',
            price: Number(product.price),
            stock: Number(product.stock),
            sku: product.sku || '',
            category: product.category || '',
            isPublic: product.isPublic !== false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: Number(formData.price),
                stock: Number(formData.stock),
            };

            if (editingProduct) {
                await api.patch(`/products/${editingProduct.id}`, data);
            } else {
                await api.post('/products', data);
            }

            setShowModal(false);
            setEditingProduct(null);
            setFormData({
                name: '',
                name_en: '',
                name_pt: '',
                name_uk: '',
                description: '',
                description_en: '',
                description_pt: '',
                description_uk: '',
                price: 0,
                stock: 0,
                sku: '',
                category: '',
                isPublic: true
            });
            fetchProducts();
        } catch (error) {
            console.error('Error saving product:', error);
            alert('Failed to save product');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await api.delete(`/products/${id}`);
                fetchProducts();
            } catch (error) {
                console.error('Error deleting product:', error);
            }
        }
    };

    const getLocalizedName = (product: any) => {
        const lang = i18n.language;
        if (lang === 'en' && product.name_en) return product.name_en;
        if (lang === 'pt' && product.name_pt) return product.name_pt;
        if (lang === 'uk' && product.name_uk) return product.name_uk;
        return product.name;
    };

    return (
        <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 fw-bold text-dark">{t('products')}</h1>
                    <p className="text-secondary mb-0">{t('manage_inventory_desc')}</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingProduct(null);
                        setFormData({
                            name: '',
                            name_en: '',
                            name_pt: '',
                            name_uk: '',
                            description: '',
                            description_en: '',
                            description_pt: '',
                            description_uk: '',
                            price: 0,
                            stock: 0,
                            sku: '',
                            category: '',
                            isPublic: true
                        });
                        setShowModal(true);
                    }}
                    className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
                >
                    <Plus size={20} />
                    {t('add')} {t('products')}
                </Button>
            </div>

            <Card className="shadow-sm border-0 rounded-4 overflow-hidden">
                <Card.Body className="p-0">
                    <div className="p-4 border-bottom bg-light bg-opacity-10">
                        <InputGroup style={{ maxWidth: '400px' }}>
                            <InputGroup.Text className="bg-white border-end-0">
                                <Search size={18} className="text-muted" />
                            </InputGroup.Text>
                            <Form.Control
                                placeholder={t('search')}
                                className="border-start-0"
                            />
                        </InputGroup>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">{t('loading_products')}</p>
                            </div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="text-uppercase small fw-bold text-muted">
                                        <th className="px-4 py-3">{t('product_info')}</th>
                                        <th className="px-4 py-3">{t('category')}</th>
                                        <th className="px-4 py-3">{t('inventory')}</th>
                                        <th className="px-4 py-3">{t('price')}</th>
                                        <th className="px-4 py-3 text-end">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((product) => (
                                        <tr key={product.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div className="p-2 rounded-3 bg-light me-3">
                                                        <Package size={20} className="text-primary" />
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark">{getLocalizedName(product)}</div>
                                                        <small className="text-muted">{t('sku')}: {product.sku || t('not_available_short')}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <Badge bg="secondary-subtle" text="secondary" className="px-2 py-1 rounded-2 border border-secondary-subtle">
                                                    {product.category || t('general_category')}
                                                </Badge>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className={`d-flex align-items-center fw-medium ${product.stock < 10 ? 'text-danger' : 'text-success'}`}>
                                                    {product.stock < 10 && <AlertCircle size={16} className="me-1" />}
                                                    {product.stock} {t('in_stock')}
                                                </div>
                                                {product.stock < 10 && <small className="text-danger opacity-75">{t('low_stock')}</small>}
                                            </td>
                                            <td className="px-4 py-3 fw-bold text-dark">
                                                €{Number(product.price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle as="button" className="btn btn-link text-muted p-0 border-0 shadow-none">
                                                        <MoreHorizontal size={20} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm border-0">
                                                        <Dropdown.Item onClick={() => handleEdit(product)}>{t('edit')}</Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item onClick={() => handleDelete(product.id)} className="text-danger">{t('delete')}</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        {!loading && products.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                {t('no_products_found')}
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-4" size="lg">
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold">{editingProduct ? t('edit') : t('add')} {t('products')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-4">
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">Default Name (Required)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Internal/System Name"
                                        required
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">Name (English)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name_en}
                                        onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">Name (Português)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name_pt}
                                        onChange={(e) => setFormData({ ...formData, name_pt: e.target.value })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">Name (Українська)</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={formData.name_uk}
                                        onChange={(e) => setFormData({ ...formData, name_uk: e.target.value })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        <hr className="my-4 opacity-50" />

                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">Description (English)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.description_en}
                                onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">Description (Português)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.description_pt}
                                onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">Description (Українська)</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={2}
                                value={formData.description_uk}
                                onChange={(e) => setFormData({ ...formData, description_uk: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>

                        <hr className="my-4 opacity-50" />

                        <Row>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">{t('category')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Hair Care, etc."
                                        value={formData.category}
                                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">{t('price')} (€)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        required
                                        min="0"
                                        step="0.01"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4}>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-secondary">{t('stock')}</Form.Label>
                                    <Form.Control
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.stock}
                                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                        </Row>
                        <Row>
                            <Col md={6}>
                                <Form.Group className="mb-0">
                                    <Form.Label className="small fw-bold text-secondary">{t('sku')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Optional identifier"
                                        value={formData.sku}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6} className="d-flex align-items-center">
                                <Form.Check
                                    type="checkbox"
                                    id="isProductPublic"
                                    label={t('visible_to_customers') || 'Visible to Customers'}
                                    checked={formData.isPublic}
                                    onChange={(e) => setFormData({ ...formData, isPublic: e.target.checked })}
                                />
                            </Col>
                        </Row>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 pt-0 pb-4 pe-4">
                        <Button variant="light" onClick={() => setShowModal(false)} className="px-4">
                            {t('cancel')}
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 fw-semibold">
                            {t('save')} {t('products')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Products;
