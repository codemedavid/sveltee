import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, LogOut, Loader2 } from 'lucide-react';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [links, setLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newLink, setNewLink] = useState({
        text: '',
        href: '',
        icon: '',
        subtext: '',
        variant: 'generic',
        active: true
    });
    const [error, setError] = useState(null);
    const [isAdding, setIsAdding] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        checkUser();
    }, []);

    const checkUser = () => {
        // Client-side authentication check
        const isAdmin = sessionStorage.getItem('isAdmin');
        if (isAdmin !== 'true') {
            navigate('/login');
        } else {
            fetchLinks();
        }
    };

    const fetchLinks = async () => {
        const defaults = [
            { text: 'Price List', href: '#', icon: '💰', order: 1 },
            { text: 'WhatsApp', href: '#', icon: '💬', order: 2 },
            { text: 'COA', href: '#', icon: '📄', order: 3 },
            { text: 'Instruction & Guides', href: '#', icon: '📘', order: 4 },
            { text: 'Tiktok', href: '#', icon: '🎵', order: 5 },
            { text: 'Instagram', href: '#', icon: '📷', order: 6 },
            { text: 'Thread', href: '#', icon: '🧵', order: 7 },
        ];

        try {
            setError(null);
            const { data, error: fetchError } = await supabase
                .from('links')
                .select('*')
                .order('order', { ascending: true });

            if (fetchError) throw fetchError;

            if (!data || data.length === 0) {
                // If DB is empty, Show Defaults IMMEDIATELY so user sees buttons
                console.log('DB empty. Showing defaults.');

                // Add default properties to defaults if missing
                const enrichedDefaults = defaults.map(d => ({
                    ...d,
                    variant: 'generic',
                    subtext: '',
                    active: true,
                    ...d // preserve existing
                }));

                setLinks(enrichedDefaults);

                // Try to persist them in background
                const { error: insertError } = await supabase.from('links').insert(enrichedDefaults);
                if (insertError) {
                    console.error('Failed to auto-seed DB:', insertError);
                    // We don't block the UI, just log it. 
                    // Optionally set a small warning state if needed, but user just wants to see buttons.
                } else {
                    // If successful, refetch to get IDs
                    const { data: newData } = await supabase.from('links').select('*').order('order');
                    if (newData) setLinks(newData);
                }
            } else {
                setLinks(data);
            }
        } catch (err) {
            console.error('Error fetching links:', err);
            // On error, ALSO show defaults so admin isn't blank
            setLinks(defaults);

            if (err.message && err.message.includes('relation "public.links" does not exist')) {
                setError('CRITICAL: Database table "links" is missing. Please run the SUPABASE_SETUP.sql script in your Supabase Dashboard SQL Editor.');
            } else {
                setError('Database connection issue. Showing default links (unsaved).');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        sessionStorage.removeItem('isAdmin');
        navigate('/login');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this link?')) return;

        try {
            const { error } = await supabase.from('links').delete().eq('id', id);
            if (error) throw error;
            setLinks(links.filter(link => link.id !== id));
        } catch (error) {
            alert('Error deleting link. Ensure database policies allow public writes.');
        }
    };

    const handleAddLink = async (e) => {
        e.preventDefault();
        try {
            const maxOrder = links.length > 0 ? Math.max(...links.map(l => l.order || 0)) : -1;

            const { data, error } = await supabase
                .from('links')
                .insert([{ ...newLink, order: maxOrder + 1 }])
                .select();

            if (error) throw error;

            setLinks([...links, data[0]]);
            setLinks([...links, data[0]]);
            setNewLink({
                text: '',
                href: '',
                icon: '',
                subtext: '',
                variant: 'generic',
                active: true
            });
            setIsAdding(false);
        } catch (error) {
            alert('Error adding link: ' + error.message);
        }
    };



    if (loading) return (
        <div className="min-h-screen flex items-center justify-center">
            <Loader2 className="animate-spin text-[var(--color-accent)]" />
        </div>
    );

    return (
        <div className="admin-container">
            {/* Background Decor */}
            <div className="bg-decor bg-orb-1"></div>
            <div className="bg-decor bg-orb-2"></div>
            <div className="bg-decor bg-orb-3"></div>
            <div className="bg-logo-watermark"></div>

            <header className="admin-header animate-fade-in">
                <h1 className="admin-title">Admin Dashboard</h1>
                <button
                    onClick={handleLogout}
                    className="logout-button"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </header>

            <div className="admin-links-list">
                {links.map((link) => (
                    <div key={link.id} className="admin-link-card">
                        <div className="link-info">
                            <span className="link-icon">{link.icon}</span>
                            <div className="link-details">
                                <p className="link-text">
                                    {link.text}
                                    {link.variant === 'verified' && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-1 rounded">✓ Verified</span>}
                                    {!link.active && <span className="ml-2 text-xs bg-gray-100 text-gray-500 px-1 rounded">Inactive</span>}
                                </p>
                                {link.subtext && <p className="text-xs text-gray-500">{link.subtext}</p>}
                                <p className="link-url">{link.href}</p>
                            </div>
                        </div>

                        <button
                            onClick={() => handleDelete(link.id)}
                            className="delete-button"
                            title="Delete Link"
                        >
                            <Trash2 size={18} />
                        </button>
                    </div>
                ))}

                {links.length === 0 && !isAdding && (
                    <div className="empty-state">
                        {error ? (
                            <div className="text-red-500 bg-red-50 p-4 rounded-lg">
                                <p className="font-bold">Error:</p>
                                <p>{error}</p>
                                <button
                                    onClick={() => fetchLinks()}
                                    className="mt-2 bg-red-100 px-3 py-1 rounded text-red-700 text-sm hover:bg-red-200"
                                >
                                    Retry
                                </button>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center">
                                <Loader2 className="animate-spin mb-2" />
                                <p>Loading defaults...</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {isAdding ? (
                <form onSubmit={handleAddLink} className="add-link-form">
                    <h3 className="form-title">Add New Link</h3>
                    <div className="form-group">
                        <input
                            type="text"
                            placeholder="Button Text (e.g. Shop Peptides)"
                            className="admin-input"
                            value={newLink.text}
                            onChange={(e) => setNewLink({ ...newLink, text: e.target.value })}
                            required
                            autoFocus
                        />
                        <input
                            type="url"
                            placeholder="URL (https://...)"
                            className="admin-input"
                            value={newLink.href}
                            onChange={(e) => setNewLink({ ...newLink, href: e.target.value })}
                            required
                        />
                        <input
                            type="text"
                            placeholder="Icon Emoji (e.g. 🛒)"
                            className="admin-input"
                            value={newLink.icon}
                            onChange={(e) => setNewLink({ ...newLink, icon: e.target.value })}
                        />
                        <input
                            type="text"
                            placeholder="Subtext (Optional description)"
                            className="admin-input"
                            value={newLink.subtext}
                            onChange={(e) => setNewLink({ ...newLink, subtext: e.target.value })}
                        />
                        <select
                            className="admin-input"
                            value={newLink.variant}
                            onChange={(e) => setNewLink({ ...newLink, variant: e.target.value })}
                        >
                            <option value="generic">Generic Button</option>
                            <option value="verified">Verified (Blue Check)</option>
                            <option value="social">Social Media</option>
                            <option value="highlight">Highlight</option>
                        </select>
                        <div className="form-actions">
                            <button type="submit" className="save-button">
                                Save Link
                            </button>
                            <button
                                type="button"
                                onClick={() => setIsAdding(false)}
                                className="cancel-button"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <button
                    onClick={() => setIsAdding(true)}
                    className="add-button-trigger"
                >
                    <Plus size={20} /> Add New Link
                </button>
            )}
        </div>
    );
};

export default AdminDashboard;
