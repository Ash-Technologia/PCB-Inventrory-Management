import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import PageTransition from '../common/PageTransition';

const Layout = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50 flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-72 min-h-screen">
                <main className="p-8 max-w-7xl mx-auto">
                    <PageTransition>
                        <Outlet />
                    </PageTransition>
                </main>
            </div>
        </div>
    );
};

export default Layout;
