import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Search, Tag, Clock, MoreHorizontal } from 'lucide-react';
import { Table, Button, Form, Modal, InputGroup, Card, Dropdown, Spinner, Row, Col } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface Service {
    id: string;
    name: string;
    description?: string;
    price: number;
    duration: number;
    isPublic: boolean;
    category?: {
        name: string;
    };
}

const Services: React.FC = () => {
    const { t, i18n } = useTranslation();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingService, setEditingService] = useState<Service | null>(null);
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
        duration: 30,
        isPublic: true
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const response = await api.get('/services');
            setServices(response.data);
        } catch (error) {
            console.error('Error fetching services:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (service: Service) => {
        setEditingService(service);
        setFormData({
            name: service.name,
            name_en: (service as any).name_en || '',
            name_pt: (service as any).name_pt || '',
            name_uk: (service as any).name_uk || '',
            description: service.description || '',
            description_en: (service as any).description_en || '',
            description_pt: (service as any).description_pt || '',
            description_uk: (service as any).description_uk || '',
            price: Number(service.price),
            duration: Number(service.duration),
            isPublic: service.isPublic !== false
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const data = {
                ...formData,
                price: Number(formData.price),
                duration: Number(formData.duration),
            };

            if (editingService) {
                await api.patch(`/services/${editingService.id}`, data);
            } else {
                await api.post('/services', data);
            }

            setShowModal(false);
            setEditingService(null);
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
                duration: 30,
                isPublic: true
            });
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);
            alert('Failed to save service');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this service?')) {
            try {
                await api.delete(`/services/${id}`);
                fetchServices();
            } catch (error) {
                console.error('Error deleting service:', error);
            }
        }
    };

    const getLocalizedName = (service: any) => {
        const lang = i18n.language;
        if (lang === 'en' && service.name_en) return service.name_en;
        if (lang === 'pt' && service.name_pt) return service.name_pt;
        if (lang === 'uk' && service.name_uk) return service.name_uk;
        return service.name;
    };

    const getLocalizedDescription = (service: any) => {
        const lang = i18n.language;
        if (lang === 'en' && service.description_en) return service.description_en;
        if (lang === 'pt' && service.description_pt) return service.description_pt;
        if (lang === 'uk' && service.description_uk) return service.description_uk;
        return service.description || t('no_notes_available');
    };

    return (
        <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 fw-bold text-dark">{t('services')}</h1>
                    <p className="text-secondary mb-0">{t('manage_services_desc')}</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => {
                        setEditingService(null);
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
                            duration: 30,
                            isPublic: true
                        });
                        setShowModal(true);
                    }}
                    className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
                >
                    <Plus size={20} />
                    {t('add')} {t('services')}
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
                                <p className="mt-2 text-muted">{t('loading_services')}</p>
                            </div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="text-uppercase small fw-bold text-muted">
                                        <th className="px-4 py-3">{t('name')}</th>
                                        <th className="px-4 py-3">{t('category')}</th>
                                        <th className="px-4 py-3">{t('duration')}</th>
                                        <th className="px-4 py-3">{t('price')}</th>
                                        <th className="px-4 py-3 text-end">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {services.map((service) => (
                                        <tr key={service.id}>
                                            <td className="px-4 py-3">
                                                <div className="fw-semibold text-dark">{getLocalizedName(service)}</div>
                                                <small className="text-muted d-block text-truncate" style={{ maxWidth: '300px' }}>
                                                    {getLocalizedDescription(service)}
                                                </small>
                                            </td>
                                            <td className="px-4 py-3 text-muted">
                                                <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1 rounded-2">
                                                    <Tag size={12} className="me-1" />
                                                    {service.category?.name || t('uncategorized')}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-secondary">
                                                <Clock size={16} className="me-2 text-muted" />
                                                {service.duration} min
                                            </td>
                                            <td className="px-4 py-3 fw-bold text-dark">
                                                €{Number(service.price).toFixed(2)}
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle as="button" className="btn btn-link text-muted p-0 border-0 shadow-none">
                                                        <MoreHorizontal size={20} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm border-0">
                                                        <Dropdown.Item onClick={() => handleEdit(service)}>{t('edit')}</Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item onClick={() => handleDelete(service.id)} className="text-danger">{t('delete')}</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        {!loading && services.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                {t('service_catalog_empty')}
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-4" size="lg">
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold">{editingService ? t('edit') : t('add')} {t('services')}</Modal.Title>
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
                                    <Form.Label className="small fw-bold text-secondary">{t('duration')} (min)</Form.Label>
                                    <Form.Control
                                        type="number"
                                        required
                                        min="1"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                                        className="py-2"
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={4} className="d-flex align-items-center">
                                <Form.Check
                                    type="checkbox"
                                    id="isPublic"
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
                            {t('save')} {t('services')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Services;
