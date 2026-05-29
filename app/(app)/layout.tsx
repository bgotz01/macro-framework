import LayoutWrapper from "@/components/layout-wrapper";

export default function AppLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <LayoutWrapper>{children}</LayoutWrapper>;
}
