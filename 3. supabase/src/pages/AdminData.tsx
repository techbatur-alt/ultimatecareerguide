import { useState, useRef } from "react";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Upload, Download, FileSpreadsheet, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

const TABLES = ["profiles", "sponsors", "sponsorship_allocations", "subscriptions", "sub_profiles", "device_sessions", "schools"] as const;
type TableName = typeof TABLES[number];

const TABLE_COLUMNS: Record<TableName, string[]> = {
  profiles: ["id", "email", "salutation", "first_name", "last_name", "nickname", "id_number", "mobile_1", "mobile_2", "telephone_home", "telephone_work", "home_address", "work_address", "date_of_birth", "role", "profile_picture_url"],
  sponsors: ["name", "email", "phone", "organization", "amount_pledged", "amount_paid", "tier", "status", "notes"],
  sponsorship_allocations: ["sponsor_id", "category", "description", "quantity", "amount", "status"],
  subscriptions: ["user_id", "start_date", "end_date", "amount_paid", "payment_method", "order_number", "status"],
  sub_profiles: ["account_holder_id", "first_name", "last_name", "nickname", "email", "mobile_1", "mobile_2", "home_address", "work_address", "profile_type"],
  device_sessions: ["user_id", "device_fingerprint", "user_agent"],
  schools: ["name", "emis_number", "province", "district", "institution_type", "institution_category", "address", "contact_name", "contact_email", "contact_phone", "learner_count", "notes"],
};

const TABLE_NOTES: Partial<Record<TableName, string>> = {
  schools: "Use 'province' and 'district' as text names — they will be auto-matched to existing province/district records. Unknown districts will be left blank.",
};

const AdminData = () => {
  const { user } = useAuth();
  const [selectedTable, setSelectedTable] = useState<TableName>("schools");
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  if (!user) {
    return (
      <div className="container py-20 text-center">
        <h1 className="font-display text-2xl font-bold mb-4">Admin Access Required</h1>
        <p className="text-muted-foreground">Please sign in to access the data management panel.</p>
      </div>
    );
  }

  const downloadTemplate = () => {
    const columns = TABLE_COLUMNS[selectedTable];
    const ws = XLSX.utils.aoa_to_sheet([columns]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, selectedTable);
    XLSX.writeFile(wb, `${selectedTable}_template.xlsx`);
    toast.success(`Template for "${selectedTable}" downloaded.`);
  };

  const parseFile = async (file: File): Promise<Record<string, any>[]> => {
    const buf = await file.arrayBuffer();
    const wb = XLSX.read(buf, { type: "array" });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "", raw: false });
    // Normalize header keys: trim + lowercase + spaces->_
    return rows.map((r) => {
      const out: Record<string, any> = {};
      Object.entries(r).forEach(([k, v]) => {
        const nk = String(k).trim().toLowerCase().replace(/\s+/g, "_");
        if (v !== "" && v !== null && v !== undefined) out[nk] = typeof v === "string" ? v.trim() : v;
      });
      return out;
    }).filter((r) => Object.keys(r).length > 0);
  };

  const transformSchoolsRow = async (
    row: Record<string, any>,
    provinceMap: Map<string, string>,
    districtMap: Map<string, string>,
  ): Promise<Record<string, any>> => {
    const out: Record<string, any> = {
      name: row.name ?? "",
      emis_number: row.emis_number ?? row.emis ?? "",
      address: row.address ?? "",
      contact_name: row.contact_name ?? "",
      contact_email: row.contact_email ?? "",
      contact_phone: row.contact_phone ?? "",
      notes: row.notes ?? "",
      institution_type: row.institution_type ?? "",
      institution_category: row.institution_category ?? "",
      learner_count: row.learner_count ? Number(row.learner_count) || 0 : 0,
    };
    const prov = String(row.province ?? "").toLowerCase().trim();
    if (prov && provinceMap.has(prov)) out.province_id = provinceMap.get(prov);
    const dist = String(row.district ?? "").toLowerCase().trim();
    if (dist && districtMap.has(dist)) out.district_id = districtMap.get(dist);
    return out;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setResults(null);

    try {
      const rows = await parseFile(file);

      if (rows.length === 0) {
        toast.error("No valid data rows found in file.");
        setUploading(false);
        return;
      }

      // Pre-load lookups for schools
      let provinceMap = new Map<string, string>();
      let districtMap = new Map<string, string>();
      if (selectedTable === "schools") {
        const { data: provs } = await supabase.from("provinces").select("id, name");
        provs?.forEach((p: any) => provinceMap.set(p.name.toLowerCase().trim(), p.id));
        const { data: dists } = await supabase.from("districts").select("id, name");
        dists?.forEach((d: any) => districtMap.set(d.name.toLowerCase().trim(), d.id));
      }

      let successCount = 0;
      const errors: string[] = [];

      for (let i = 0; i < rows.length; i++) {
        let payload: any = rows[i];
        if (selectedTable === "schools") {
          payload = await transformSchoolsRow(rows[i], provinceMap, districtMap);
          if (!payload.name) {
            errors.push(`Row ${i + 1}: missing "name"`);
            continue;
          }
        }
        const { error } = await supabase.from(selectedTable).insert(payload);
        if (error) {
          errors.push(`Row ${i + 1}: ${error.message}`);
        } else {
          successCount++;
        }
      }

      setResults({ success: successCount, errors });
      if (successCount > 0) toast.success(`${successCount} rows inserted successfully.`);
      if (errors.length > 0) toast.error(`${errors.length} rows failed.`);
    } catch (err: any) {
      toast.error(`Failed to parse file: ${err?.message ?? "unknown error"}`);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="container py-12 max-w-3xl">
      <h1 className="font-display text-3xl font-bold mb-2">Data Management</h1>
      <p className="text-muted-foreground mb-8">Upload CSV or Excel (.xlsx/.xls) data, or download templates for database tables.</p>

      {/* Table selector */}
      <div className="mb-6">
        <label className="font-display text-sm font-bold block mb-2">Select Table</label>
        <select
          value={selectedTable}
          onChange={(e) => { setSelectedTable(e.target.value as TableName); setResults(null); }}
          className="w-full border border-border rounded-lg px-4 py-3 bg-card text-foreground font-display"
        >
          {TABLES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {/* Columns preview */}
      <div className="bg-muted rounded-lg p-4 mb-6">
        <p className="font-display text-sm font-bold mb-2">Columns for "{selectedTable}":</p>
        <p className="text-xs text-muted-foreground">{TABLE_COLUMNS[selectedTable].join(", ")}</p>
        {TABLE_NOTES[selectedTable] && (
          <p className="text-xs text-muted-foreground mt-2 italic">{TABLE_NOTES[selectedTable]}</p>
        )}
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <Button onClick={downloadTemplate} variant="outline" className="flex-1 h-14 font-display">
          <Download className="w-5 h-5 mr-2" />
          Download Template
        </Button>

        <div className="flex-1 relative">
          <input
            ref={fileRef}
            type="file"
            accept=".csv,.txt,.xlsx,.xls"
            onChange={handleUpload}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            disabled={uploading}
          />
          <Button className="w-full h-14 font-display" disabled={uploading}>
            {uploading ? (
              <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Uploading...</>
            ) : (
              <><Upload className="w-5 h-5 mr-2" /> Upload CSV / Excel</>
            )}
          </Button>
        </div>
      </div>

      {/* Results */}
      {results && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="font-display font-bold mb-3 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5" /> Upload Results
          </h3>
          <div className="flex items-center gap-2 mb-2 text-sm">
            <CheckCircle className="w-4 h-4 text-green-600" />
            <span>{results.success} rows inserted successfully</span>
          </div>
          {results.errors.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2 text-sm text-destructive">
                <AlertCircle className="w-4 h-4" />
                <span>{results.errors.length} rows failed</span>
              </div>
              <div className="bg-muted rounded p-3 max-h-40 overflow-y-auto text-xs">
                {results.errors.map((err, i) => (
                  <p key={i} className="text-destructive">{err}</p>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AdminData;
