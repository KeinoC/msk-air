"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, MapPin } from "lucide-react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";

export default function AppSidebar() {
	const pathname = usePathname();

	const isActive = (path: string) => {
		return pathname === path || pathname.startsWith(`${path}/`);
	};

	return (
		<Sidebar collapsible="offcanvas" variant="sidebar">
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupContent>
						<SidebarMenu>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActive("/dashboard")}
									tooltip="Dashboard"
								>
									<Link href="/dashboard">
										<LayoutDashboard />
										<span>Dashboard</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<SidebarMenuButton
									asChild
									isActive={isActive("/dashboard/locations")}
									tooltip="Locations"
								>
									<Link href="/dashboard/locations">
										<MapPin />
										<span>Locations</span>
									</Link>
								</SidebarMenuButton>
							</SidebarMenuItem>
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}

