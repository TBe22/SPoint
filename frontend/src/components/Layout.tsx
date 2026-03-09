import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { LayoutDashboard, Users, Calendar, ShoppingBag, LogOut, Package, Globe, Home, BookOpen, ShoppingCart, History, Settings, MessageSquare } from 'lucide-react';
import { Navbar, Nav, Container, Button, NavDropdown, Badge } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import api from '../lib/api';

const Layout: React.FC = () => {
    const { logout, user } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { t, i18n } = useTranslation();
    const [settings, setSettings] = React.useState<any>(null);
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await api.get('/settings');
                setSettings(res.data);
            } catch (error) {
                console.error('Error fetching settings:', error);
            }
        };
        const fetchUnreadCount = async () => {
            try {
                const res = await api.get('/messages/unread/count');
                setUnreadCount(res.data.count);
            } catch (error) {
                console.error('Error fetching unread count:', error);
            }
        };
        fetchSettings();
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000); // Pulse every 30s
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    const adminNavItems = [
        { path: '/dashboard', icon: <LayoutDashboard size={20} />, label: t('dashboard') },
        { path: '/staff', icon: <Users size={20} />, label: t('staff') },
        { path: '/clients', icon: <Users size={20} />, label: t('clients') },
        { path: '/appointments', icon: <Calendar size={20} />, label: t('appointments') },
        { path: '/services', icon: <ShoppingBag size={20} />, label: t('services') },
        { path: '/products', icon: <Package size={20} />, label: t('products') },
        { path: '/sales', icon: <ShoppingBag size={20} />, label: t('sales') },
        {
            path: '/message-center',
            icon: <MessageSquare size={20} />,
            label: (
                <div className="d-flex align-items-center justify-content-between w-100">
                    <span>{t('message_center')}</span>
                    {unreadCount > 0 && <Badge bg="danger" pill>{unreadCount}</Badge>}
                </div>
            )
        },
        { path: '/configuration', icon: <Settings size={20} />, label: t('settings') },
    ];

    const clientNavItems = [
        { path: '/my-dashboard', icon: <Home size={20} />, label: t('my_dashboard') },
        { path: '/my-booking', icon: <BookOpen size={20} />, label: t('book_online') },
        { path: '/online-store', icon: <ShoppingCart size={20} />, label: t('shop') },
        { path: '/my-orders', icon: <History size={20} />, label: t('my_orders') },
        {
            path: '/my-inbox',
            icon: <MessageSquare size={20} />,
            label: (
                <div className="d-flex align-items-center justify-content-between w-100">
                    <span>{t('inbox')}</span>
                    {unreadCount > 0 && <Badge bg="danger" pill>{unreadCount}</Badge>}
                </div>
            )
        },
    ];

    const navItems = user?.role === 'CLIENT' ? clientNavItems : adminNavItems;

    return (
        <div className="d-flex flex-column min-vh-100">
            {/* Top Navbar */}
            <Navbar bg="white" expand="lg" className="border-bottom shadow-sm py-3 px-4 fixed-top">
                <Container fluid>
                    <Navbar.Brand as={Link} to="/" className="fw-bold text-primary fs-4">
                        {settings?.business_name || t('business_name')}
                    </Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav className="align-items-center flex-row gap-2 gap-md-3">
                            <div className="d-flex align-items-center bg-light rounded-pill px-3 py-1 me-2">
                                <Globe size={16} className="text-muted me-2" />
                                <NavDropdown
                                    title={<span className="fw-bold small">{i18n.language.toUpperCase()}</span>}
                                    id="language-dropdown"
                                    className="custom-lang-dropdown"
                                >
                                    <NavDropdown.Item onClick={() => changeLanguage('en')}>English</NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => changeLanguage('pt')}>Português</NavDropdown.Item>
                                    <NavDropdown.Item onClick={() => changeLanguage('uk')}>Українська</NavDropdown.Item>
                                </NavDropdown>
                            </div>
                            <span className="me-2 text-muted d-none d-lg-inline border-start ps-3">
                                {t('welcome')}, <strong>{user?.name || t('guest')}</strong>
                            </span>
                            <Button variant="outline-danger" size="sm" onClick={handleLogout} className="d-flex align-items-center gap-2 border-0 rounded-pill px-3">
                                <LogOut size={16} /> <span className="d-none d-sm-inline">{t('logout')}</span>
                            </Button>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            <div className="d-flex mt-5 pt-3">
                {/* Fixed Sidebar for larger screens */}
                <Nav className="flex-column bg-white border-end vh-100 position-fixed d-none d-lg-flex" style={{ width: '240px', paddingTop: '2rem' }}>
                    {navItems.map((item) => (
                        <Nav.Link
                            key={item.path}
                            as={Link}
                            to={item.path}
                            className={`px-4 py-3 d-flex align-items-center gap-3 transition-all ${location.pathname === item.path ? 'bg-primary text-white shadow-sm mx-3 rounded-3' : 'text-dark hover-bg-light'}`}
                        >
                            {item.icon} {item.label}
                        </Nav.Link>
                    ))}
                </Nav>

                {/* Main Content Area */}
                <main className="flex-grow-1 p-4 d-flex flex-column" style={{ marginLeft: '240px', minHeight: 'calc(100vh - 80px)' }}>
                    <Container fluid className="flex-grow-1">
                        <Outlet />
                    </Container>
                    <footer className="mt-auto pt-5 pb-4 text-center text-muted small border-top">
                        <p className="mb-0">{t('designed_by')} <span className="fw-bold text-primary">ServApp</span></p>
                    </footer>
                </main>
            </div>

            <style>{`
                .transition-all { transition: all 0.2s ease-in-out; }
                .hover-bg-light:hover { background-color: #f8f9fa; border-radius: 8px; margin-inline: 12px; }
                .custom-lang-dropdown .dropdown-toggle::after { vertical-align: middle; }
                .custom-lang-dropdown .nav-link { padding: 0 !important; color: #4b5563 !important; }
                @media (max-width: 991.98px) {
                    main { margin-left: 0 !important; }
                }
            `}</style>
        </div>
    );
};

export default Layout;
