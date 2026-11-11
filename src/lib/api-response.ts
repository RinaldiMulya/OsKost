import { NextResponse } from "next/server";
import { getCorsHeaders } from "./cors";

export interface ApiMeta {
    timestamp: string;
    requestId?: string;
    [key: string]: unknown;
}

export interface ApiErrorPayload {
    code: string;
    message: string;
    details?: unknown;
}

export interface ApiResponse<T = unknown> {
    data: T | null;
    meta: ApiMeta;
    error: ApiErrorPayload | null;
}

export function apiSuccess<T = unknown>(
    data: T,
    meta?: Record<string, unknown>,
    status = 200,
    headers?: HeadersInit
): NextResponse<ApiResponse<T>> {
    const responsePayload: ApiResponse<T> = {
        data,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
        error: null,
    };

    const corsHeaders = getCorsHeaders(null);

    return NextResponse.json(responsePayload, {
        status,
        headers: {
            ...corsHeaders,
            ...Object.fromEntries(new Headers(headers).entries()),
        },
    });
}

export function apiError(
    code: string,
    message: string,
    status = 400,
    details?: unknown,
    meta?: Record<string, unknown>,
    headers?: HeadersInit
): NextResponse<ApiResponse<null>> {
    const responsePayload: ApiResponse<null> = {
        data: null,
        meta: {
            timestamp: new Date().toISOString(),
            ...meta,
        },
        error: {
            code,
            message,
            details: details || null,
        },
    };

    const corsHeaders = getCorsHeaders(null);

    return NextResponse.json(responsePayload, {
        status,
        headers: {
            ...corsHeaders,
            ...Object.fromEntries(new Headers(headers).entries()),
        },
    });
}
