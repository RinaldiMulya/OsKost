export default function RoomDetailLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // No shared Navbar — room detail has its own pill-shaped header
    return <>{children}</>;
}
