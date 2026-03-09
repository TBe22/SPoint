import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { Users, Calendar, Euro, TrendingUp } from 'lucide-react';
import { Row, Col, Card, Container, Spinner, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';

const Dashboard: React.FC = () => {
    const { t } = useTranslation();
    const [stats, setStats] = useState({
        totalClients: 0,
        totalStaff: 0,
        totalAppointments: 0,
        todayAppointments: 0,
        totalRevenue: 0,
        recentSales: [],
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const response = await api.get('/reports/dashboard');
            setStats(response.data);
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Container className="d-flex justify-content-center align-items-center" style={{ height: '300px' }}>
                <Spinner animation="border" variant="primary" />
            </Container>
        );
    }

    const StatCard = ({ title, value, icon, color, trend }: any) => (
        <Card className="h-100 shadow-sm border-0 rounded-4">
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div className={`p-3 rounded-4 bg-${color}-light`} style={{ backgroundColor: `var(--bs-${color}-bg-subtle)` }}>
                        {React.cloneElement(icon, { size: 24, className: `text-${color}` })}
                    </div>
                    {trend && (
                        <Badge bg="success-subtle" text="success" className="px-2 py-1">
                            <TrendingUp size={14} className="me-1" /> {trend}
                        </Badge>
                    )}
                </div>
                <Card.Subtitle className="text-secondary mb-1 fw-medium">{title}</Card.Subtitle>
                <Card.Title className="fs-3 fw-bold mb-0">{value}</Card.Title>
            </Card.Body>
        </Card>
    );

    return (
        <div className="py-4">
            <h1 className="h3 mb-4 fw-bold text-dark">{t('dashboard')}</h1>

            <Row className="g-4 mb-4">
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title={t('revenue_overview')}
                        value={`€${Number(stats.totalRevenue).toFixed(2)}`}
                        icon={<Euro />}
                        color="primary"
                        trend="+12%"
                    />
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title={t('total_clients')}
                        value={stats.totalClients}
                        icon={<Users />}
                        color="info"
                    />
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title={t('active_appointments')}
                        value={stats.todayAppointments}
                        icon={<Calendar />}
                        color="success"
                    />
                </Col>
                <Col xs={12} md={6} lg={3}>
                    <StatCard
                        title={t('staff')}
                        value={stats.totalStaff}
                        icon={<Users />}
                        color="warning"
                    />
                </Col>
            </Row>

            <Row className="g-4">
                <Col lg={7}>
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                        <Card.Body>
                            <Card.Title className="h5 fw-bold mb-4">{t('recent_transactions')}</Card.Title>
                            <div className="table-responsive">
                                <table className="table table-hover align-middle mb-0">
                                    <thead className="table-light">
                                        <tr>
                                            <th>{t('actions')} ID</th>
                                            <th>{t('date')}</th>
                                            <th className="text-end">{t('total')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stats.recentSales.map((sale: any) => (
                                            <tr key={sale.id}>
                                                <td>
                                                    <span className="fw-medium">#{sale.id.slice(0, 8)}</span>
                                                </td>
                                                <td className="text-muted">
                                                    {new Date(sale.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="text-end fw-bold">
                                                    €{Number(sale.total).toFixed(2)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                                {stats.recentSales.length === 0 && (
                                    <div className="text-center py-5 text-muted">
                                        {t('no_transactions_found') || 'No recent transactions found'}
                                    </div>
                                )}
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col lg={5}>
                    <Card className="shadow-sm border-0 rounded-4 h-100">
                        <Card.Body>
                            <Card.Title className="h5 fw-bold mb-4">{t('revenue_overview')}</Card.Title>
                            <div className="bg-light rounded-4 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
                                <div className="text-center text-muted">
                                    <TrendingUp size={48} className="mb-3 opacity-25" />
                                    <p>{t('revenue_analytics_chart') || 'Revenue Analytics Chart'}</p>
                                    <small>{t('connect_chart_msg') || '(Connect your preferred charting library here)'}</small>
                                </div>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default Dashboard;
