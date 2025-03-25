import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = ({ user, onLogout }) => {
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const response = await axios.get(`http://localhost:5000/api/users/dashboard/${user._id}`);
                if (response.data.success) {
                    setDashboardData(response.data.user);
                }
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError('Error loading dashboard data');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [user._id]);

    if (loading) {
        return <div className="dashboard-container">Loading...</div>;
    }

    if (error) {
        return <div className="dashboard-container error">{error}</div>;
    }

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h2>Welcome, {dashboardData.name}!</h2>
                <button onClick={onLogout} className="logout-button">
                    Logout
                </button>
            </div>

            <div className="user-info">
                <div className="profile-section">
                    <img
                        src={`http://localhost:5000${dashboardData.profileImage}`}
                        alt="Profile"
                        className="profile-image"
                    />
                    <div className="user-details">
                        <p><strong>Name:</strong> {dashboardData.name}</p>
                        <p><strong>Email:</strong> {dashboardData.email}</p>
                    </div>
                </div>

                <div className="attendance-section">
                    <h3>Attendance History</h3>
                    <div className="attendance-list">
                        {dashboardData.attendance.length > 0 ? (
                            dashboardData.attendance.map((record, index) => (
                                <div key={index} className="attendance-record">
                                    <span className="date">
                                        {new Date(record.date).toLocaleDateString()}
                                    </span>
                                    <span className={`status ${record.status}`}>
                                        {record.status}
                                    </span>
                                </div>
                            ))
                        ) : (
                            <p className="no-attendance">No attendance records found</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard; 