"use client";

import { useEffect, useState } from "react";
import AppSidebar from "../features/sidebar-menu/sidebar";
import {
	SidebarInset,
	SidebarProvider,
} from "@/components/ui/sidebar";

const SIDEBAR_STATE_KEY = "sidebar:state";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	// Load sidebar state from localStorage (defaults to open)
	const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);

	// Load persisted state after hydration
	useEffect(() => {
		const saved = localStorage.getItem(SIDEBAR_STATE_KEY);
		if (saved !== null) {
			setSidebarOpen(JSON.parse(saved));
		}
	}, []);

	// Persist sidebar state to localStorage
	useEffect(() => {
		localStorage.setItem(SIDEBAR_STATE_KEY, JSON.stringify(sidebarOpen));
	}, [sidebarOpen]);

	return (
		<SidebarProvider open={sidebarOpen} onOpenChange={setSidebarOpen}>
			<AppSidebar />
			<SidebarInset className="pt-16">
				<div className="flex flex-1 flex-col gap-4 p-4 md:gap-6 md:p-6 lg:gap-8 lg:p-8">
					{children}
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
}

