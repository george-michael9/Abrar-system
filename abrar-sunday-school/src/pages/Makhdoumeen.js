import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMakhdoumeen, getMakhdoumeenByClass, getClassesByKhadem, getClassById, getClasses, createMakhdoum, updateMakhdoum } from '../services/mockApi';
import GlassCard from '../components/GlassCard';
import GlassButton from '../components/GlassButton';
import GlassInput from '../components/GlassInput';
import Modal from '../components/Modal';
import styles from './Makhdoumeen.module.css';

const Makhdoumeen = () => {
    const { user, isKhadem, logout } = useAuth();
    const navigate = useNavigate();
    const [makhdoumeen, setMakhdoumeen] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMakhdoum, setEditingMakhdoum] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        dateOfBirth: '',
        gender: 'Male',
        classId: '',
        motherName: '',
        motherPhone: '',
        fatherName: '',
        fatherPhone: '',
        emergencyContact: '',
        street: '',
        city: '',
        area: '',
        postalCode: '',
        diseasesAllergies: '',
        bloodType: '',
        medications: '',
        specialNeeds: '',
        notes: ''
    });
    const [allClasses, setAllClasses] = useState([]);

    useEffect(() => {
        loadMakhdoumeen();
        setAllClasses(getClasses());
        // eslint-disable-next-line
    }, [user]);

    const loadMakhdoumeen = () => {
        if (isKhadem()) {
            const myClasses = getClassesByKhadem(user.userId);
            let allChildren = [];
            myClasses.forEach(cls => {
                const children = getMakhdoumeenByClass(cls.classId);
                allChildren = [...allChildren, ...children];
            });
            setMakhdoumeen(allChildren);
        } else {
            setMakhdoumeen(getMakhdoumeen());
        }
    };

    const filteredMakhdoumeen = makhdoumeen.filter(m =>
        m.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.makhdoumCode.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleOpenModal = (makhdoum = null) => {
        if (makhdoum) {
            setEditingMakhdoum(makhdoum);
            setFormData({
                fullName: makhdoum.fullName || '',
                dateOfBirth: makhdoum.dateOfBirth || '',
                gender: makhdoum.gender || 'Male',
                classId: makhdoum.classId || '',
                motherName: makhdoum.motherName || '',
                motherPhone: makhdoum.motherPhone || '',
                fatherName: makhdoum.fatherName || '',
                fatherPhone: makhdoum.fatherPhone || '',
                emergencyContact: makhdoum.emergencyContact || '',
                street: makhdoum.street || '',
                city: makhdoum.city || '',
                area: makhdoum.area || '',
                postalCode: makhdoum.postalCode || '',
                diseasesAllergies: makhdoum.diseasesAllergies || '',
                bloodType: makhdoum.bloodType || '',
                medications: makhdoum.medications || '',
                specialNeeds: makhdoum.specialNeeds || '',
                notes: makhdoum.notes || ''
            });
        } else {
            setEditingMakhdoum(null);
            setFormData({
                fullName: '',
                dateOfBirth: '',
                gender: 'Male',
                classId: allClasses.length > 0 ? allClasses[0].classId : '',
                motherName: '',
                motherPhone: '',
                fatherName: '',
                fatherPhone: '',
                emergencyContact: '',
                street: '',
                city: '',
                area: '',
                postalCode: '',
                diseasesAllergies: '',
                bloodType: '',
                medications: '',
                specialNeeds: '',
                notes: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingMakhdoum(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const dataToSave = {
            ...formData,
            classId: parseInt(formData.classId),
            category: 'Regular',
            photo: '',
            createdBy: user.userId
        };

        if (editingMakhdoum) {
            updateMakhdoum(editingMakhdoum.makhdoumId, dataToSave);
        } else {
            createMakhdoum(dataToSave);
        }

        loadMakhdoumeen();
        handleCloseModal();
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <div className={styles.headerContent}>
                    <div>
                        <h1 className={styles.pageTitle}>
                            <span className="text-gradient">Makhdoumeen</span>
                        </h1>
                        <p className={styles.pageSubtitle}>Manage children profiles</p>
                    </div>
                    <div className={styles.headerActions}>
                        <GlassButton variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
                            🏠 Dashboard
                        </GlassButton>
                        <GlassButton variant="danger" size="sm" onClick={logout}>
                            🚪 Logout
                        </GlassButton>
                    </div>
                </div>
            </header>

            <div className={styles.container}>
                <div className={styles.toolbar}>
                    <input
                        type="text"
                        placeholder="🔍 Search by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className={styles.searchInput}
                    />
                    <GlassButton variant="primary" onClick={() => handleOpenModal()}>
                        ➕ Add New Child
                    </GlassButton>
                </div>

                <div className={styles.grid}>
                    {filteredMakhdoumeen.map(makhdoum => {
                        const classData = getClassById(makhdoum.classId);
                        return (
                            <GlassCard key={makhdoum.makhdoumId} className={styles.card}>
                                <div className={styles.cardHeader}>
                                    <div className={styles.avatar}>
                                        {makhdoum.fullName.charAt(0)}
                                    </div>
                                    <div className={styles.badge}>{makhdoum.makhdoumCode}</div>
                                </div>
                                <h3 className={styles.name}>{makhdoum.fullName}</h3>
                                <div className={styles.details}>
                                    <div className={styles.detail}>
                                        <span>🎂</span>
                                        {makhdoum.dateOfBirth ? new Date(makhdoum.dateOfBirth).toLocaleDateString() : 'N/A'}
                                    </div>
                                    <div className={styles.detail}>
                                        <span>👤</span>
                                        {makhdoum.gender || 'N/A'}
                                    </div>
                                    <div className={styles.detail}>
                                        <span>📚</span>
                                        {classData?.className || 'No Class'}
                                    </div>
                                </div>
                                <div className={styles.contacts}>
                                    {makhdoum.motherPhone && (
                                        <div className={styles.contact}>
                                            <strong>Mother:</strong> {makhdoum.motherPhone}
                                        </div>
                                    )}
                                    {makhdoum.fatherPhone && (
                                        <div className={styles.contact}>
                                            <strong>Father:</strong> {makhdoum.fatherPhone}
                                        </div>
                                    )}
                                </div>
                                <div className={styles.cardActions}>
                                    <GlassButton
                                        variant="ghost"
                                        size="sm"
                                        fullWidth
                                        onClick={() => handleOpenModal(makhdoum)}
                                    >
                                        ✏️ Edit
                                    </GlassButton>
                                </div>
                            </GlassCard>
                        );
                    })}
                </div>

                {filteredMakhdoumeen.length === 0 && (
                    <div className={styles.empty}>
                        <span className={styles.emptyIcon}>👶</span>
                        <p>No children found</p>
                    </div>
                )}
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingMakhdoum ? 'Edit Child' : 'Add New Child'}
            >
                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGrid}>
                        <GlassInput
                            label="Full Name"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleInputChange}
                            required
                        />
                        <GlassInput
                            label="Date of Birth"
                            type="date"
                            name="dateOfBirth"
                            value={formData.dateOfBirth}
                            onChange={handleInputChange}
                        />
                        <div className={styles.selectWrapper}>
                            <label className={styles.label}>Gender</label>
                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className={styles.select}
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                            </select>
                        </div>
                        <div className={styles.selectWrapper}>
                            <label className={styles.label}>Class</label>
                            <select
                                name="classId"
                                value={formData.classId}
                                onChange={handleInputChange}
                                className={styles.select}
                                required
                            >
                                {allClasses.map(cls => (
                                    <option key={cls.classId} value={cls.classId}>
                                        {cls.className}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <h3 className={styles.sectionTitle}>Parent Information</h3>
                    <div className={styles.formGrid}>
                        <GlassInput
                            label="Mother's Name"
                            name="motherName"
                            value={formData.motherName}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Mother's Phone"
                            name="motherPhone"
                            value={formData.motherPhone}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Father's Name"
                            name="fatherName"
                            value={formData.fatherName}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Father's Phone"
                            name="fatherPhone"
                            value={formData.fatherPhone}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Emergency Contact"
                            name="emergencyContact"
                            value={formData.emergencyContact}
                            onChange={handleInputChange}
                        />
                    </div>

                    <h3 className={styles.sectionTitle}>Address</h3>
                    <div className={styles.formGrid}>
                        <GlassInput
                            label="Street"
                            name="street"
                            value={formData.street}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="City"
                            name="city"
                            value={formData.city}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Area"
                            name="area"
                            value={formData.area}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Postal Code"
                            name="postalCode"
                            value={formData.postalCode}
                            onChange={handleInputChange}
                        />
                    </div>

                    <h3 className={styles.sectionTitle}>Medical Information</h3>
                    <div className={styles.formGrid}>
                        <GlassInput
                            label="Diseases/Allergies"
                            name="diseasesAllergies"
                            value={formData.diseasesAllergies}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Blood Type"
                            name="bloodType"
                            value={formData.bloodType}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Medications"
                            name="medications"
                            value={formData.medications}
                            onChange={handleInputChange}
                        />
                        <GlassInput
                            label="Special Needs"
                            name="specialNeeds"
                            value={formData.specialNeeds}
                            onChange={handleInputChange}
                        />
                    </div>

                    <div className={styles.formActions}>
                        <GlassButton type="button" variant="ghost" onClick={handleCloseModal}>
                            Cancel
                        </GlassButton>
                        <GlassButton type="submit" variant="primary">
                            {editingMakhdoum ? 'Update' : 'Create'}
                        </GlassButton>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default Makhdoumeen;
