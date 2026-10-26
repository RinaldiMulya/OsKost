"use client";

import { useState, useMemo } from "react";
import {
    AuditLogItem,
    AuditLogsSummary,
    AuditSource,
} from "@/features/super-admin/actions/audit-logs-actions";
import { AuditCategory } from "@prisma/client";
import {
    ShieldCheck,
    Search,
    Filter,
    ChevronDown,
    ChevronRight,
    Terminal,
    Copy,
    Check,
    User,
    Laptop,
    Smartphone,
    Server,
    ShieldAlert,
    KeyRound,
    CreditCard,
    Building2,
    Calendar,
    RefreshCw,
} from "lucide-react";

interface AuditLogsTableClientProps {
    initialLogs: AuditLogItem[];
    totalCount: number;
    summary: AuditLogsSummary;
}

export function AuditLogsTableClient({
    initialLogs,
    totalCount,
    summary,
}: AuditLogsTableClientProps) {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<AuditCategory | "ALL">("ALL");
    const [selectedSource, setSelectedSource] = useState<AuditSource>("ALL");
    const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // Filter logs client-side
    const filteredLogs = useMemo(() => {
        return initialLogs.filter((log) => {
            // Category filter
            if (selectedCategory !== "ALL" && log.category !== selectedCategory) {
                return false;
            }

            // Source filter
            if (selectedSource !== "ALL" && log.source !== selectedSource) {
                return false;
            }

            // Search query
            if (!searchQuery.trim()) return true;
            const q = searchQuery.toLowerCase();
            return (
                log.action.toLowerCase().includes(q) ||
                (log.actorEmail && log.actorEmail.toLowerCase().includes(q)) ||
                (log.targetId && log.targetId.toLowerCase().includes(q)) ||
                (log.targetType && log.targetType.toLowerCase().includes(q)) ||
                (log.ipAddress && log.ipAddress.toLowerCase().includes(q))
            );
        });
    }, [initialLogs, selectedCategory, selectedSource, searchQuery]);

    const handleCopy = (id: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const formatDate = (iso: string) => {
        const d = new Date(iso);
        return d.toLocaleString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
        });
    };

    const getCategoryBadge = (category: AuditCategory) => {
        switch (category) {
            case "AUTH":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">
                        <KeyRound className="w-3 h-3" />
                        AUTH
                    </span>
                );
            case "SECURITY":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200 animate-pulse">
                        <ShieldAlert className="w-3 h-3" />
                        SECURITY
                    </span>
                );
            case "SUBSCRIPTION":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <CreditCard className="w-3 h-3" />
                        SUBSCRIPTION
                    </span>
                );
            case "OWNER":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <User className="w-3 h-3" />
                        OWNER
                    </span>
                );
            case "PROPERTY":
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                        <Building2 className="w-3 h-3" />
                        PROPERTY
                    </span>
                );
            case "SYSTEM":
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                        <Server className="w-3 h-3" />
                        SYSTEM
                    </span>
                );
        }
    };

    const getSourceBadge = (source: AuditLogItem["source"]) => {
        switch (source) {
            case "SUPER_ADMIN":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-[#1A1A2E] text-[#D4A843] border border-[#8C6239]/40">
                        HQ Admin
                    </span>
                );
            case "OWNER":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700 border border-blue-200">
                        <Laptop className="w-3 h-3" />
                        Web Owner
                    </span>
                );
            case "MOBILE_API":
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-teal-50 text-teal-700 border border-teal-200">
                        <Smartphone className="w-3 h-3" />
                        Mobile Tenant
                    </span>
                );
            case "SYSTEM":
            default:
                return (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <Server className="w-3 h-3" />
                        Automated
                    </span>
                );
        }
    };

    return (
        <div className="space-y-6">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                            Total Audit Logs
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-600">
                            <ShieldCheck className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{totalCount}</span>
                        <span className="text-xs text-gray-500">record tersimpan</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-sky-600">
                            Auth Events
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                            <KeyRound className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{summary.authCount}</span>
                        <span className="text-xs text-gray-500">login & session</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-rose-600">
                            Security Alerts
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                            <ShieldAlert className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{summary.securityCount}</span>
                        <span className="text-xs text-gray-500">suspensi / impersonasi</span>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs">
                    <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                            Subscription Log
                        </span>
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <CreditCard className="w-4 h-4" />
                        </div>
                    </div>
                    <div className="mt-2 flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-gray-900">{summary.subscriptionCount}</span>
                        <span className="text-xs text-gray-500">billing & tiers</span>
                    </div>
                </div>
            </div>

            {/* Filter and Search Bar */}
            <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs space-y-3">
                <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
                    {/* Search Input */}
                    <div className="relative flex-1">
                        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari aksi (e.g. SUPER_ADMIN_LOGIN), email actor, target ID, atau IP..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm bg-gray-50/80 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#8C6239]/20 focus:border-[#8C6239] transition-all"
                        />
                    </div>

                    {/* Source Selector */}
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 whitespace-nowrap">Source:</span>
                        <select
                            value={selectedSource}
                            onChange={(e) => setSelectedSource(e.target.value as AuditSource)}
                            className="px-3 py-2 text-xs font-semibold bg-gray-50 border border-gray-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#8C6239]/20 focus:border-[#8C6239]"
                        >
                            <option value="ALL">Semua Source</option>
                            <option value="SUPER_ADMIN">HQ Super Admin</option>
                            <option value="OWNER">Web Pemilik Kost</option>
                            <option value="MOBILE_API">Mobile Tenant API</option>
                            <option value="SYSTEM">Automated System</option>
                        </select>
                    </div>
                </div>

                {/* Category Pill Filters */}
                <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-gray-100">
                    <span className="text-xs font-medium text-gray-500 mr-2 flex items-center gap-1">
                        <Filter className="w-3 h-3" /> Kategori:
                    </span>
                    {(["ALL", "AUTH", "SECURITY", "SUBSCRIPTION", "OWNER", "PROPERTY", "SYSTEM"] as const).map(
                        (cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                                    selectedCategory === cat
                                        ? "bg-[#1A1A2E] text-white shadow-xs font-semibold"
                                        : "bg-gray-100/80 text-gray-600 hover:bg-gray-200/80"
                                }`}
                            >
                                {cat === "ALL" ? "Semua Kategori" : cat}
                            </button>
                        )
                    )}
                </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-semibold text-gray-900 text-sm">
                            Platform Audit Trail
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Menampilkan {filteredLogs.length} dari {totalCount} total audit log platform
                        </p>
                    </div>
                    <span className="text-xs text-gray-400 font-mono">
                        Auto-capture PostgreSQL
                    </span>
                </div>

                {filteredLogs.length === 0 ? (
                    <div className="py-12 text-center">
                        <ShieldCheck className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                        <p className="text-sm font-medium text-gray-600">
                            Tidak ada audit log yang sesuai filter
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                            Coba ubah kata kunci pencarian atau reset filter kategori/source
                        </p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs text-gray-700">
                            <thead className="bg-gray-50/75 border-b border-gray-200/80 text-gray-500 font-semibold uppercase tracking-wider text-[10px]">
                                <tr>
                                    <th className="py-3 px-4 w-8"></th>
                                    <th className="py-3 px-4">Waktu</th>
                                    <th className="py-3 px-4">Kategori</th>
                                    <th className="py-3 px-4">Source</th>
                                    <th className="py-3 px-4">Aksi / Event</th>
                                    <th className="py-3 px-4">Actor</th>
                                    <th className="py-3 px-4">Target Entitas</th>
                                    <th className="py-3 px-4">IP Address</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 font-normal">
                                {filteredLogs.map((log) => {
                                    const isExpanded = expandedRowId === log.id;
                                    const hasMetadata = log.metadata && Object.keys(log.metadata).length > 0;

                                    return (
                                        <tr
                                            key={log.id}
                                            className="hover:bg-amber-50/30 transition-colors group"
                                        >
                                            {/* Expand Toggle */}
                                            <td className="py-3.5 px-4 text-center">
                                                <button
                                                    onClick={() =>
                                                        setExpandedRowId(isExpanded ? null : log.id)
                                                    }
                                                    className="p-1 rounded-md text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
                                                    title={isExpanded ? "Tutup detail JSON" : "Lihat detail metadata JSON"}
                                                >
                                                    {isExpanded ? (
                                                        <ChevronDown className="w-4 h-4 text-gray-600" />
                                                    ) : (
                                                        <ChevronRight className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </td>

                                            {/* Timestamp */}
                                            <td className="py-3.5 px-4 whitespace-nowrap text-gray-600 font-mono">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5 text-gray-400" />
                                                    <span>{formatDate(log.createdAt)}</span>
                                                </div>
                                            </td>

                                            {/* Category */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {getCategoryBadge(log.category)}
                                            </td>

                                            {/* Source */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {getSourceBadge(log.source)}
                                            </td>

                                            {/* Action */}
                                            <td className="py-3.5 px-4 font-mono font-semibold text-gray-900">
                                                <span className="bg-gray-100 px-2 py-0.5 rounded text-[11px] border border-gray-200/80">
                                                    {log.action}
                                                </span>
                                            </td>

                                            {/* Actor */}
                                            <td className="py-3.5 px-4">
                                                {log.actorEmail ? (
                                                    <div>
                                                        <p className="font-medium text-gray-900 truncate max-w-[180px]">
                                                            {log.actorEmail}
                                                        </p>
                                                        <p className="text-[10px] text-gray-400 font-mono">
                                                            {log.actorRole || "N/A"}
                                                        </p>
                                                    </div>
                                                ) : (
                                                    <span className="text-gray-400 italic">SYSTEM</span>
                                                )}
                                            </td>

                                            {/* Target */}
                                            <td className="py-3.5 px-4 whitespace-nowrap">
                                                {log.targetType || log.targetId ? (
                                                    <span className="text-gray-600">
                                                        <span className="font-semibold text-gray-700">
                                                            {log.targetType || "Entity"}:
                                                        </span>{" "}
                                                        <span className="font-mono text-[11px] text-gray-500">
                                                            {log.targetId ? log.targetId.slice(0, 14) + "..." : "-"}
                                                        </span>
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">-</span>
                                                )}
                                            </td>

                                            {/* IP Address */}
                                            <td className="py-3.5 px-4 whitespace-nowrap font-mono text-[11px] text-gray-500">
                                                {log.ipAddress || "-"}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Expanded metadata card for currently selected row */}
                {expandedRowId && (
                    <div className="p-4 bg-slate-900 text-slate-100 border-t border-slate-800 transition-all">
                        {(() => {
                            const log = filteredLogs.find((l) => l.id === expandedRowId);
                            if (!log) return null;
                            const jsonString = JSON.stringify(
                                {
                                    id: log.id,
                                    action: log.action,
                                    category: log.category,
                                    actor: {
                                        id: log.actorId,
                                        email: log.actorEmail,
                                        role: log.actorRole,
                                    },
                                    target: {
                                        type: log.targetType,
                                        id: log.targetId,
                                    },
                                    client: {
                                        ip: log.ipAddress,
                                        userAgent: log.userAgent,
                                    },
                                    timestamp: log.createdAt,
                                    metadata: log.metadata,
                                },
                                null,
                                2
                            );

                            return (
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
                                            <Terminal className="w-4 h-4" />
                                            <span>AUDIT_LOG_ENTRY #{log.id}</span>
                                        </div>
                                        <button
                                            onClick={() => handleCopy(log.id, jsonString)}
                                            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs text-slate-300 font-mono transition-colors"
                                        >
                                            {copiedId === log.id ? (
                                                <>
                                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                                    <span className="text-emerald-400">Copied!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Copy className="w-3.5 h-3.5" />
                                                    <span>Copy JSON</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                    <pre className="text-[11px] font-mono bg-slate-950 p-3 rounded-lg overflow-x-auto text-emerald-400 max-h-60 border border-slate-800">
                                        {jsonString}
                                    </pre>
                                </div>
                            );
                        })()}
                    </div>
                )}
            </div>
        </div>
    );
}
