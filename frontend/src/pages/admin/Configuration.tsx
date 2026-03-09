import React, { useEffect, useState } from 'react';
import { Container, Card, Form, Button, Row, Col, Spinner, Alert } from 'react-bootstrap';
import { Settings, Clock, Calendar, Globe } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import api from '../../lib/api';

const Configuration: React.FC = () => {
    const { t } = useTranslation();
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: string, text: string } | null>(null);

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await api.get('/settings');
            setSettings(res.data);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = async (key: string, value: any) => {
        try {
            setSaving(true);
            await api.patch(`/settings/${key}`, { value });
            setSettings({ ...settings, [key]: value });
            setMessage({ type: 'success', text: t('setting_updated') });
            setTimeout(() => setMessage(null), 3000);
        } catch (error) {
            console.error('Update failed:', error);
            setMessage({ type: 'danger', text: t('setting_update_failed') });
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="text-center py-5"><Spinner animation="border" /></div>;

    return (
        <Container className="py-4">
            <div className="d-flex align-items-center gap-3 mb-4">
                <div className="bg-primary bg-opacity-10 p-3 rounded-circle text-primary">
                    <Settings size={32} />
                </div>
                <div>
                    <h1 className="h3 fw-bold mb-0">{t('admin_configuration')}</h1>
                    <p className="text-muted mb-0">{t('business_configuration_desc')}</p>
                </div>
            </div>

            {message && <Alert variant={message.type} className="border-0 shadow-sm rounded-4 mb-4">{message.text}</Alert>}

            <Row className="g-4">
                <Col lg={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-4 text-primary">
                                <Clock size={20} />
                                <h5 className="fw-bold mb-0">{t('weekly_working_hours')}</h5>
                            </div>
                            <Form>
                                <div className="mb-4">
                                    <Form.Label className="small fw-bold text-muted text-uppercase mb-3 d-block">{t('working_days')}</Form.Label>
                                    <div className="d-flex justify-content-between gap-2">
                                        {[
                                            { id: 1, label: t('mon') },
                                            { id: 2, label: t('tue') },
                                            { id: 3, label: t('wed') },
                                            { id: 4, label: t('thu') },
                                            { id: 5, label: t('fri') },
                                            { id: 6, label: t('sat') },
                                            { id: 0, label: t('sun') }
                                        ].map((day) => {
                                            const isWorking = settings.working_hours.days.includes(day.id);
                                            return (
                                                <Button
                                                    key={day.id}
                                                    variant={isWorking ? 'primary' : 'outline-secondary'}
                                                    className={`flex-grow-1 py-2 rounded-3 border-0 shadow-sm ${isWorking ? '' : 'bg-light'}`}
                                                    onClick={() => {
                                                        const newDays = isWorking
                                                            ? settings.working_hours.days.filter((id: number) => id !== day.id)
                                                            : [...settings.working_hours.days, day.id].sort();
                                                        setSettings({ ...settings, working_hours: { ...settings.working_hours, days: newDays } });
                                                    }}
                                                >
                                                    <div className="small fw-bold">{day.label}</div>
                                                </Button>
                                            );
                                        })}
                                    </div>
                                </div>
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">{t('opening_time')}</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={settings.working_hours.start}
                                            onChange={(e) => setSettings({ ...settings, working_hours: { ...settings.working_hours, start: e.target.value } })}
                                            className="py-2 rounded-3"
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">{t('closing_time')}</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={settings.working_hours.end}
                                            onChange={(e) => setSettings({ ...settings, working_hours: { ...settings.working_hours, end: e.target.value } })}
                                            className="py-2 rounded-3"
                                        />
                                    </Col>
                                </Row>
                                <div className="mt-4">
                                    <Button
                                        variant="primary"
                                        className="rounded-pill px-4 fw-bold shadow-sm"
                                        onClick={() => handleUpdate('working_hours', settings.working_hours)}
                                        disabled={saving}
                                    >
                                        {saving ? t('saving') : t('save_settings')}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-4 text-info">
                                <Calendar size={20} />
                                <h5 className="fw-bold mb-0">{t('rest_non_working_hours')}</h5>
                            </div>
                            <Form>
                                <Row className="g-3">
                                    <Col sm={6}>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">{t('start_break')}</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={settings.non_working_hours.start}
                                            onChange={(e) => setSettings({ ...settings, non_working_hours: { ...settings.non_working_hours, start: e.target.value } })}
                                            className="py-2 rounded-3"
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <Form.Label className="small fw-bold text-muted text-uppercase">{t('end_break')}</Form.Label>
                                        <Form.Control
                                            type="time"
                                            value={settings.non_working_hours.end}
                                            onChange={(e) => setSettings({ ...settings, non_working_hours: { ...settings.non_working_hours, end: e.target.value } })}
                                            className="py-2 rounded-3"
                                        />
                                    </Col>
                                </Row>
                                <div className="mt-4">
                                    <Button
                                        variant="info"
                                        className="rounded-pill px-4 fw-bold text-white shadow-sm"
                                        onClick={() => handleUpdate('non_working_hours', settings.non_working_hours)}
                                        disabled={saving}
                                    >
                                        {saving ? t('saving') : t('save_break_hours')}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-4 text-primary">
                                <Settings size={20} />
                                <h5 className="fw-bold mb-0">{t('business_details')}</h5>
                            </div>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('business_name')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.business_name || ''}
                                        onChange={(e) => setSettings({ ...settings, business_name: e.target.value })}
                                        onBlur={() => handleUpdate('business_name', settings.business_name)}
                                        className="py-2 rounded-3"
                                        placeholder="e.g. ServiceApp"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('public_address')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.business_address}
                                        onChange={(e) => setSettings({ ...settings, business_address: e.target.value })}
                                        onBlur={() => handleUpdate('business_address', settings.business_address)}
                                        className="py-2 rounded-3"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('service_property_address')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.service_address || ''}
                                        onChange={(e) => setSettings({ ...settings, service_address: e.target.value })}
                                        onBlur={() => handleUpdate('service_address', settings.service_address)}
                                        className="py-2 rounded-3"
                                        placeholder="Where services take place"
                                    />
                                </Form.Group>
                                <Form.Group>
                                    <Form.Label className="small fw-bold text-muted text-uppercase">{t('google_maps_link')}</Form.Label>
                                    <Form.Control
                                        type="text"
                                        value={settings.business_google_maps}
                                        onChange={(e) => setSettings({ ...settings, business_google_maps: e.target.value })}
                                        onBlur={() => handleUpdate('business_google_maps', settings.business_google_maps)}
                                        className="py-2 rounded-3"
                                    />
                                </Form.Group>
                                <div className="mt-4">
                                    <Button
                                        variant="primary"
                                        className="rounded-pill px-4 fw-bold shadow-sm"
                                        onClick={async () => {
                                            await handleUpdate('business_name', settings.business_name);
                                            await handleUpdate('business_address', settings.business_address);
                                            await handleUpdate('service_address', settings.service_address);
                                            await handleUpdate('business_google_maps', settings.business_google_maps);
                                        }}
                                        disabled={saving}
                                    >
                                        {saving ? t('saving') : t('save_details')}
                                    </Button>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                <Col lg={6}>
                    <Card className="border-0 shadow-sm rounded-4 h-100">
                        <Card.Body className="p-4">
                            <div className="d-flex align-items-center gap-2 mb-4 text-success">
                                <Globe size={20} />
                                <h5 className="fw-bold mb-0">{t('localization_timezone')}</h5>
                            </div>
                            <Form.Group>
                                <Form.Label className="small fw-bold text-muted text-uppercase">{t('system_timezone')}</Form.Label>
                                <Form.Select
                                    value={settings.timezone}
                                    onChange={(e) => handleUpdate('timezone', e.target.value)}
                                    className="py-2 rounded-3"
                                    disabled={saving}
                                >
                                    <option value="Europe/Lisbon">Europe/Lisbon (PT)</option>
                                    <option value="UTC">UTC (Universal Time)</option>
                                    <option value="Europe/London">Europe/London</option>
                                    <option value="Europe/Kiev">Europe/Kiev (UA)</option>
                                </Form.Select>
                                <Form.Text className="text-muted mt-2 d-block">
                                    {t('timezone_desc')}
                                </Form.Text>
                            </Form.Group>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Configuration;
