import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Plus, Search, Mail, Phone, MoreHorizontal } from 'lucide-react';
import { Table, Button, Form, Modal, InputGroup, Card, Dropdown, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

interface Client {
    id: string;
    name: string;
    email: string;
    clientProfile?: {
        phone: string;
        notes?: string;
    };
}

const Clients: React.FC = () => {
    const { t } = useTranslation();
    const [clients, setClients] = useState<Client[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingClient, setEditingClient] = useState<Client | null>(null);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', notes: '' });
    const [searchQuery, setSearchQuery] = useState('');

    const filteredClients = React.useMemo(() => {
        if (!searchQuery.trim()) return clients;
        const q = searchQuery.toLowerCase();
        return clients.filter(c =>
            c.name.toLowerCase().includes(q) ||
            c.email.toLowerCase().includes(q) ||
            (c.clientProfile?.phone && c.clientProfile.phone.includes(q))
        );
    }, [clients, searchQuery]);

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            const response = await api.get('/clients');
            setClients(response.data);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (client: Client) => {
        setEditingClient(client);
        setFormData({
            name: client.name,
            email: client.email,
            phone: client.clientProfile?.phone || '',
            notes: client.clientProfile?.notes || ''
        });
        setShowModal(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (editingClient) {
                await api.patch(`/clients/${editingClient.id}`, formData);
            } else {
                await api.post('/clients', formData);
            }
            setShowModal(false);
            setEditingClient(null);
            setFormData({ name: '', email: '', phone: '', notes: '' });
            fetchClients();
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Failed to save client');
        }
    };

    const handleDelete = async (id: string) => {
        if (window.confirm('Are you sure you want to delete this client?')) {
            try {
                await api.delete(`/clients/${id}`);
                fetchClients();
            } catch (error) {
                console.error('Error deleting client:', error);
            }
        }
    };

    return (
        <div className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h1 className="h3 mb-1 fw-bold text-dark">{t('clients')}</h1>
                    <p className="text-secondary mb-0">Manage and track your customer base</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowModal(true)}
                    className="d-flex align-items-center gap-2 px-4 py-2 rounded-3 shadow-sm"
                >
                    <Plus size={20} />
                    {t('add')} {t('clients')}
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
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </InputGroup>
                    </div>

                    <div className="table-responsive">
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-2 text-muted">Loading clients...</p>
                            </div>
                        ) : (
                            <Table hover className="align-middle mb-0">
                                <thead className="table-light">
                                    <tr className="text-uppercase small fw-bold text-muted">
                                        <th className="px-4 py-3">{t('clients')}</th>
                                        <th className="px-4 py-3">Contact Information</th>
                                        <th className="px-4 py-3 text-center">{t('status')}</th>
                                        <th className="px-4 py-3 text-end">{t('actions')}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredClients.map((client) => (
                                        <tr key={client.id}>
                                            <td className="px-4 py-3">
                                                <div className="d-flex align-items-center">
                                                    <div
                                                        className="rounded-circle bg-primary bg-opacity-10 d-flex align-items-center justify-content-center text-primary fw-bold me-3"
                                                        style={{ width: '40px', height: '40px' }}
                                                    >
                                                        {client.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="fw-semibold text-dark">{client.name}</div>
                                                        <small className="text-muted">Since {new Date().getFullYear()}</small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="small text-dark mb-1 d-flex align-items-center gap-2">
                                                    <Mail size={14} className="text-muted" /> {client.email}
                                                </div>
                                                <div className="small text-muted d-flex align-items-center gap-2">
                                                    <Phone size={14} className="text-muted" /> {client.clientProfile?.phone || '-'}
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1 rounded-2">
                                                    Active
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-end">
                                                <Dropdown align="end">
                                                    <Dropdown.Toggle as="button" className="btn btn-link text-muted p-0 border-0 shadow-none">
                                                        <MoreHorizontal size={20} />
                                                    </Dropdown.Toggle>
                                                    <Dropdown.Menu className="shadow-sm border-0">
                                                        <Dropdown.Item onClick={() => handleEdit(client)}>{t('edit')}</Dropdown.Item>
                                                        <Dropdown.Item href="#">View {t('appointments')}</Dropdown.Item>
                                                        <Dropdown.Divider />
                                                        <Dropdown.Item onClick={() => handleDelete(client.id)} className="text-danger">{t('delete')}</Dropdown.Item>
                                                    </Dropdown.Menu>
                                                </Dropdown>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                        {!loading && filteredClients.length === 0 && (
                            <div className="text-center py-5 text-muted">
                                {searchQuery ? t('no_clients_found') || 'No clients found matching your search.' : 'No clients found. Start by adding one!'}
                            </div>
                        )}
                    </div>
                </Card.Body>
            </Card>

            {/* Create Client Modal */}
            <Modal show={showModal} onHide={() => setShowModal(false)} centered className="rounded-4">
                <Modal.Header closeButton className="border-bottom-0 pb-0">
                    <Modal.Title className="fw-bold">{editingClient ? t('edit') : t('add')} {t('clients')}</Modal.Title>
                </Modal.Header>
                <Form onSubmit={handleSubmit}>
                    <Modal.Body className="pt-4">
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">{t('name')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="e.g. John Doe"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">{t('email')}</Form.Label>
                            <Form.Control
                                type="email"
                                placeholder="john@example.com"
                                required
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label className="small fw-bold text-secondary">{t('phone')}</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="+1 (555) 000-0000"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>
                        <Form.Group className="mb-0">
                            <Form.Label className="small fw-bold text-secondary">{t('description')}</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                placeholder="Any additional details..."
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="py-2"
                            />
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer className="border-top-0 pt-0 pb-4 pe-4">
                        <Button variant="light" onClick={() => setShowModal(false)} className="px-4">
                            {t('cancel')}
                        </Button>
                        <Button variant="primary" type="submit" className="px-4 fw-semibold">
                            {t('save')} {t('clients')}
                        </Button>
                    </Modal.Footer>
                </Form>
            </Modal>
        </div>
    );
};

export default Clients;
