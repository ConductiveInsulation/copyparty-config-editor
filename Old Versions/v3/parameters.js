/**
 * parameters.js
 * Enthält die vollständige Definition aller Copyparty-Volume-Optionen.
 * Basierend auf copyparty v1.19.0
 */

const SHARE_OPTIONS = [
    // ==========================================
    // 1. ACL PRIMITIVES (Die atomaren Rechte)
    // ==========================================
    { param: "r", type: "acl_primitive", category: "acl", desc: "Read: list folder contents, download files.", configMode: "acl" },
    { param: "w", type: "acl_primitive", category: "acl", desc: "Write: upload files; need 'r' to see the uploads.", configMode: "acl" },
    { param: "m", type: "acl_primitive", category: "acl", desc: "Move: move files and folders; need 'w' at destination.", configMode: "acl" },
    { param: "d", type: "acl_primitive", category: "acl", desc: "Delete: permanently delete files and folders.", configMode: "acl" },
    { param: "g", type: "acl_primitive", category: "acl", desc: "Get: download files, but cannot see folder contents.", configMode: "acl" },
    { param: "G", type: "acl_primitive", category: "acl", desc: "UpGet: 'get', but can see filekeys of their own uploads.", configMode: "acl" },
    { param: "h", type: "acl_primitive", category: "acl", desc: "HTML: 'get', but folders return their index.html.", configMode: "acl" },
    { param: ".", type: "acl_primitive", category: "acl", desc: "Dots: user can ask to show dotfiles in listings.", configMode: "acl" },
    { param: "a", type: "acl_primitive", category: "acl", desc: "Admin: can see uploader IPs, config-reload.", configMode: "acl" },
    { param: "A", type: "acl_primitive", category: "acl", desc: "All: same as 'rwmda.' (Full Access + Dotfiles).", configMode: "acl" },

    // ==========================================
    // 2. UPLOADS (General)
    // ==========================================
    { param: "dedup", type: "bool", category: "storage", desc: "Enable symlink-based file deduplication.", configMode: "flag" },
    { param: "hardlink", type: "bool", category: "storage", desc: "Enable hardlink-based deduplication (fallback to symlinks).", configMode: "flag" },
    { param: "hardlinkonly", type: "bool", category: "storage", desc: "Dedup with hardlink only, never symlink.", configMode: "flag" },
    { param: "reflink", type: "bool", category: "storage", desc: "Enable reflink-based deduplication (CoW).", configMode: "flag" },
    { param: "safededup", type: "bool", category: "storage", desc: "Verify on-disk data before using it for dedup (slower but safer).", configMode: "flag" },
    { param: "noclone", type: "bool", category: "storage", desc: "Take dupe data from clients, even if available on HDD.", configMode: "flag" },
    { param: "nodupe", type: "bool", category: "upload", desc: "Reject upload if file with same name exists.", configMode: "flag" },
    { param: "sparse", type: "bool", category: "storage", desc: "Force use of sparse files (S3).", configMode: "flag" },
    { param: "nosparse", type: "bool", category: "storage", desc: "Deny use of sparse files (slow storage).", configMode: "flag" },
    { param: "daw", type: "bool", category: "upload", desc: "Enable full WebDAV write support (PUT overwrites files). Dangerous.", configMode: "flag" },
    { param: "nosub", type: "bool", category: "upload", desc: "Force all uploads into the top folder.", configMode: "flag" },
    { param: "magic", type: "bool", category: "upload", desc: "Enable filetype detection for nameless uploads.", configMode: "flag" },
    { param: "gz", type: "bool", category: "upload", desc: "Allow server-side gzip compression of uploads (?gz).", configMode: "flag" },
    { param: "xz", type: "bool", category: "upload", desc: "Allow server-side lzma compression of uploads (?xz).", configMode: "flag" },
    
    // Inputs / Strings / Numbers
    { param: "chmod_d", type: "string", category: "system", desc: "Unix-permission for new dirs (e.g., 755).", configMode: "key" },
    { param: "chmod_f", type: "string", category: "system", desc: "Unix-permission for new files (e.g., 644).", configMode: "key" },
    { param: "uid", type: "number", category: "system", desc: "Change owner of new files to unix-user ID.", configMode: "key" },
    { param: "gid", type: "number", category: "system", desc: "Change owner of new files to unix-group ID.", configMode: "key" },
    { param: "put_name", type: "string", category: "upload", desc: "Fallback filename for nameless uploads.", configMode: "key" },
    { param: "put_ck", type: "string", category: "upload", desc: "Default checksum-hasher for PUT/WebDAV.", configMode: "key" },
    { param: "bup_ck", type: "string", category: "upload", desc: "Default checksum-hasher for bup/basic uploads.", configMode: "key" },
    { param: "pk", type: "string", category: "upload", desc: "Force server-side compression (e.g., 'xz,9').", configMode: "key" },

    // ==========================================
    // 3. UPLOAD RULES (Limits & Logic)
    // ==========================================
    { param: "maxn", type: "string", category: "limits", desc: "Max N uploads over time (e.g., '250,600').", configMode: "key" },
    { param: "maxb", type: "size", category: "limits", desc: "Max bytes over time (e.g., '1g,300').", configMode: "key" },
    { param: "vmaxb", type: "size", category: "limits", desc: "Total volume size limit (e.g. '50G').", configMode: "key" },
    { param: "vmaxn", type: "size", category: "limits", desc: "Max files in volume (e.g. '4k').", configMode: "key" },
    { param: "sz", type: "string", category: "limits", desc: "Allowed filesize range (e.g., '1k-3m').", configMode: "key" },
    { param: "df", type: "size", category: "limits", desc: "Ensure free disk space (e.g., '1g').", configMode: "key" },
    
    { param: "medialinks", type: "bool", category: "upload", desc: "Return medialinks for non-up2k uploads.", configMode: "flag" },
    { param: "wo_up_readme", type: "bool", category: "upload", desc: "Write-only users can upload logues without rename.", configMode: "flag" },
    { param: "rand", type: "bool", category: "upload", desc: "Force randomized filenames (9 chars).", configMode: "flag" },
    { param: "nrand", type: "number", category: "upload", desc: "Length of randomized filenames.", configMode: "key" },
    
    { param: "u2ow", type: "select", options: ["0", "1", "2"], category: "upload", desc: "Overwrite existing? 0=no, 1=if-older, 2=always.", configMode: "key" },
    { param: "u2ts", type: "select", options: ["fc", "fu"], category: "upload", desc: "Timestamp: [f]orce [c]lient-time or [u]pload-time.", configMode: "key" },
    { param: "u2abort", type: "select", options: ["0", "1", "2", "3"], category: "upload", desc: "Allow aborting uploads? 0=no, 1=strict, 2=ip-chk, 3=acct-chk.", configMode: "key" },

    // ==========================================
    // 4. UPLOAD ROTATION
    // ==========================================
    { param: "rotn", type: "string", category: "rotation", desc: "Subfolders structure (e.g., '100,3').", configMode: "key" },
    { param: "rotf", type: "string", category: "rotation", desc: "Date-formatted organizing (e.g., '%Y-%m/%d-%H').", configMode: "key" },
    { param: "lifetime", type: "number", category: "rotation", desc: "Delete uploads after N seconds.", configMode: "key" },

    // ==========================================
    // 5. DATABASE & SEARCH
    // ==========================================
    { param: "e2d", type: "bool", category: "database", desc: "Enable database (search + undo).", configMode: "flag" },
    { param: "e2ds", type: "bool", category: "database", desc: "Scan writable folders on startup.", configMode: "flag" },
    { param: "e2dsa", type: "bool", category: "database", desc: "Scan ALL folders on startup.", configMode: "flag" },
    { param: "e2t", type: "bool", category: "database", desc: "Enable multimedia indexing (tags).", configMode: "flag" },
    { param: "e2ts", type: "bool", category: "database", desc: "Scan existing files for tags on startup.", configMode: "flag" },
    { param: "e2tsr", type: "bool", category: "database", desc: "Full rescan (delete metadata DB).", configMode: "flag" },
    { param: "d2ts", type: "bool", category: "database", desc: "Disable metadata collection for existing.", configMode: "flag" },
    { param: "d2d", type: "bool", category: "database", desc: "Disable ALL database features.", configMode: "flag" },
    { param: "dotsrch", type: "bool", category: "database", desc: "Show dotfiles in search results.", configMode: "flag" },
    { param: "nodotsrch", type: "bool", category: "database", desc: "Hide dotfiles in search results.", configMode: "flag" },
    
    { param: "dbd", type: "select", options: ["acid", "swal", "wal", "yolo"], category: "database", desc: "DB speed-durability tradeoff.", configMode: "key" },
    { param: "hist", type: "string", category: "database", desc: "Path for thumbnails/indexes (e.g., /tmp/cdb).", configMode: "key" },
    { param: "scan", type: "number", category: "database", desc: "Scan interval in seconds.", configMode: "key" },
    { param: "nohash", type: "string", category: "database", desc: "Regex to skip hashing (e.g., '\\.iso$').", configMode: "key" },
    { param: "noidx", type: "string", category: "database", desc: "Regex to ignore files completely.", configMode: "key" },
    { param: "noforget", type: "bool", category: "database", desc: "Don't forget files when deleted from disk.", configMode: "flag" },
    { param: "forget_ip", type: "number", category: "database", desc: "Forget uploader-IP after N seconds (GDPR).", configMode: "key" },

    // ==========================================
    // 6. THUMBNAILS & MEDIA
    // ==========================================
    { param: "dthumb", type: "bool", category: "media", desc: "Disable all thumbnails.", configMode: "flag" },
    { param: "dvthumb", type: "bool", category: "media", desc: "Disable video thumbnails.", configMode: "flag" },
    { param: "dathumb", type: "bool", category: "media", desc: "Disable audio thumbnails (spectrograms).", configMode: "flag" },
    { param: "dithumb", type: "bool", category: "media", desc: "Disable image thumbnails.", configMode: "flag" },
    { param: "pngquant", type: "bool", category: "media", desc: "Compress waveforms 33% better.", configMode: "flag" },
    { param: "thsize", type: "string", category: "media", desc: "Thumbnail resolution (WxH).", configMode: "key" },
    { param: "convt", type: "number", category: "media", desc: "Conversion timeout (seconds).", configMode: "key" },
    { param: "crop", type: "select", options: ["y", "n", "fy", "fn"], category: "media", desc: "Center-cropping behavior.", configMode: "key" },
    { param: "th3x", type: "select", options: ["y", "n", "fy", "fn"], category: "media", desc: "Enable 3x resolution.", configMode: "key" },
    { param: "ext_th", type: "string", category: "media", desc: "Custom thumb for extension (e.g. 's=/b.png').", configMode: "key" },

    // Audio Tags
    { param: "mte", type: "string", category: "media", desc: "Tags to index/display (comma list).", configMode: "key" },
    { param: "mth", type: "string", category: "media", desc: "Tags to hide (comma list).", configMode: "key" },
    { param: "mtp", type: "string", category: "media", desc: "Tag processor settings.", configMode: "key" },

    // ==========================================
    // 7. CLIENT / VIEW / UX
    // ==========================================
    { param: "grid", type: "bool", category: "view", desc: "Show grid/thumbnails by default.", configMode: "flag" },
    { param: "gsel", type: "bool", category: "view", desc: "Select files in grid by ctrl-click.", configMode: "flag" },
    { param: "sort", type: "select", options: ["name", "size", "date", "ext"], category: "view", desc: "Default sort order.", configMode: "key" },
    { param: "nsort", type: "bool", category: "view", desc: "Natural-sort of leading digits.", configMode: "flag" },
    { param: "unlist", type: "string", category: "view", desc: "Regex: Don't list matching files.", configMode: "key" },
    { param: "html_head", type: "string", category: "view", desc: "Inject text or file (@PATH) into <head>.", configMode: "key" },
    { param: "tcolor", type: "string", category: "view", desc: "Theme color (hex code).", configMode: "key" },
    { param: "nodirsz", type: "bool", category: "view", desc: "Don't show total folder size.", configMode: "flag" },
    { param: "robots", type: "bool", category: "view", desc: "Allow indexing by search engines.", configMode: "flag" },
    { param: "norobots", type: "bool", category: "view", desc: "Ask search engines to leave.", configMode: "flag" },
    { param: "nohtml", type: "bool", category: "view", desc: "Return html and markdown as text/html.", configMode: "flag" },
    { param: "no_sb_md", type: "bool", category: "security", desc: "Disable JS sandbox for markdown.", configMode: "flag" },
    { param: "md_sba", type: "string", category: "security", desc: "Iframe allow-prop for markdown.", configMode: "key" },

    // ==========================================
    // 8. HANDLERS & HOOKS (Automation)
    // ==========================================
    { param: "on404", type: "string", category: "automation", desc: "Handle 404s by executing PY file.", configMode: "key" },
    { param: "on403", type: "string", category: "automation", desc: "Handle 403s by executing PY file.", configMode: "key" },
    
    // Hooks (Paths to scripts)
    { param: "xbu", type: "string", category: "automation", desc: "Execute CMD before upload starts.", configMode: "key" },
    { param: "xau", type: "string", category: "automation", desc: "Execute CMD after upload finishes.", configMode: "key" },
    { param: "xiu", type: "string", category: "automation", desc: "Execute CMD after volume idle.", configMode: "key" },
    { param: "xbc", type: "string", category: "automation", desc: "Execute CMD before file copy.", configMode: "key" },
    { param: "xac", type: "string", category: "automation", desc: "Execute CMD after file copy.", configMode: "key" },
    { param: "xbr", type: "string", category: "automation", desc: "Execute CMD before rename/move.", configMode: "key" },
    { param: "xar", type: "string", category: "automation", desc: "Execute CMD after rename/move.", configMode: "key" },
    { param: "xbd", type: "string", category: "automation", desc: "Execute CMD before delete.", configMode: "key" },
    { param: "xad", type: "string", category: "automation", desc: "Execute CMD after delete.", configMode: "key" },
    { param: "xm",  type: "string", category: "automation", desc: "Execute CMD on message.", configMode: "key" },
    { param: "xban", type: "string", category: "automation", desc: "Execute CMD on ban.", configMode: "key" },

    // ==========================================
    // 9. OPENGRAPH (Discord Embeds)
    // ==========================================
    { param: "og", type: "bool", category: "opengraph", desc: "Enable OpenGraph (disables hotlinking).", configMode: "flag" },
    { param: "og_site", type: "string", category: "opengraph", desc: "Sitename (default: --name).", configMode: "key" },
    { param: "og_desc", type: "string", category: "opengraph", desc: "Description text for all files.", configMode: "key" },
    { param: "og_th", type: "string", category: "opengraph", desc: "Thumbnail format (e.g., 'jf').", configMode: "key" },
    { param: "og_title", type: "string", category: "opengraph", desc: "Fallback title.", configMode: "key" },
    { param: "og_ua", type: "string", category: "opengraph", desc: "Only send OG html if UA matches regex.", configMode: "key" },

    // ==========================================
    // 10. TEXTFILES & TAILING
    // ==========================================
    { param: "md_hist", type: "string", category: "text", desc: "Markdown backups path (s=sub, v=volHist).", configMode: "key" },
    { param: "exp", type: "bool", category: "text", desc: "Enable textfile expansion.", configMode: "flag" },
    { param: "txt_eol", type: "select", options: ["lf", "crlf"], category: "text", desc: "EOL conversion when writing docs.", configMode: "key" },
    
    { param: "notail", type: "bool", category: "download", desc: "Disable ?tail (continuous download).", configMode: "flag" },
    { param: "tail_rate", type: "number", category: "download", desc: "Check for new data every N sec.", configMode: "key" },
    { param: "tail_who", type: "select", options: ["1", "2", "3"], category: "download", desc: "Restrict ?tail: 1=admins, 2=authed, 3=all.", configMode: "key" },

    // ==========================================
    // 11. OTHERS & ACCESS KEYS
    // ==========================================
    { param: "dots", type: "bool", category: "security", desc: "Enable option to show dotfiles (needs read acc).", configMode: "flag" },
    { param: "hide", type: "bool", category: "security", desc: "Hide volume from root listing.", configMode: "flag" },
    { param: "guest", type: "bool", category: "security", desc: "Allow guests (ignore global pwd).", configMode: "flag" },
    
    { param: "fk", type: "number", category: "access_keys", desc: "Per-file accesskeys length (filesize/inode bound).", configMode: "key" },
    { param: "fka", type: "number", category: "access_keys", desc: "Per-file accesskeys length (static).", configMode: "key" },
    { param: "dk", type: "number", category: "access_keys", desc: "Per-directory accesskeys length.", configMode: "key" },
    { param: "dks", type: "bool", category: "access_keys", desc: "Dirkeys allow browsing subdirs.", configMode: "flag" },
    
    { param: "rss", type: "bool", category: "view", desc: "Allow '?rss' URL suffix.", configMode: "flag" },
    { param: "rmagic", type: "bool", category: "system", desc: "Expensive analysis for mimetype accuracy.", configMode: "flag" },
    { param: "ups_who", type: "select", options: ["2"], category: "view", desc: "Restrict recent uploads list (2=authed).", configMode: "key" },
    
    // Download limits
    { param: "no-zip", type: "bool", category: "download", desc: "Disable 'Download as ZIP'.", configMode: "flag" },
    { param: "no-tar", type: "bool", category: "download", desc: "Disable 'Download as TAR'.", configMode: "flag" },
    { param: "zip_who", type: "select", options: ["2"], category: "download", desc: "Restrict zip-dl (2=authed).", configMode: "key" },
    { param: "zipmaxn", type: "size", category: "download", desc: "Reject zip-dl if > N files (e.g. 9k).", configMode: "key" },
    { param: "zipmaxs", type: "size", category: "download", desc: "Reject zip-dl if > Size (e.g. 2g).", configMode: "key" },
    { param: "nopipe", type: "bool", category: "download", desc: "Disable race-the-beam (dl unfinished).", configMode: "flag" },
    
    { param: "davauth", type: "bool", category: "system", desc: "Ask WebDAV clients to login for all folders.", configMode: "flag" }
];
