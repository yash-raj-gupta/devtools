export type CmdCategory =
  | "Files"
  | "Search"
  | "Process"
  | "Network"
  | "Disk"
  | "Archive"
  | "Permissions"
  | "Git"
  | "Package";

export interface CmdEntry {
  id: string;
  intent: string;
  category: CmdCategory;
  keywords: string[];
  commands: { cmd: string; note?: string }[];
}

export const CMDS: CmdEntry[] = [
  // ── Files & directories ──────────────────────────────────────────────
  {
    id: "ls",
    intent: "List files in current directory",
    category: "Files",
    keywords: ["list", "files", "show", "directory", "dir", "ls", "see", "what"],
    commands: [
      { cmd: "ls", note: "Names only" },
      { cmd: "ls -la", note: "All files (incl. hidden), long format" },
      { cmd: "ls -lh", note: "Long format, human-readable sizes" },
      { cmd: "ls -lt", note: "Sorted by modified time, newest first" },
      { cmd: "ls -lS", note: "Sorted by size, largest first" },
      { cmd: "ls -R", note: "Recursive into sub-directories" },
    ],
  },
  {
    id: "tree",
    intent: "Show directory as a tree",
    category: "Files",
    keywords: ["tree", "structure", "hierarchy", "nested", "folders"],
    commands: [
      { cmd: "tree", note: "Full tree" },
      { cmd: "tree -L 2", note: "Limit depth to 2 levels" },
      { cmd: "tree -I 'node_modules|.git'", note: "Ignore noisy dirs" },
    ],
  },
  {
    id: "pwd",
    intent: "Print current working directory",
    category: "Files",
    keywords: ["where", "path", "current", "working", "directory", "pwd"],
    commands: [{ cmd: "pwd" }],
  },
  {
    id: "cd",
    intent: "Change directory",
    category: "Files",
    keywords: ["cd", "change", "go", "navigate", "enter", "into", "directory", "folder"],
    commands: [
      { cmd: "cd <path>" },
      { cmd: "cd ..", note: "Up one level" },
      { cmd: "cd -", note: "Back to previous directory" },
      { cmd: "cd ~", note: "Home directory" },
    ],
  },
  {
    id: "mkdir",
    intent: "Create a new directory",
    category: "Files",
    keywords: ["mkdir", "make", "create", "new", "directory", "folder"],
    commands: [
      { cmd: "mkdir <name>" },
      { cmd: "mkdir -p a/b/c", note: "Create nested parents as needed" },
    ],
  },
  {
    id: "touch",
    intent: "Create an empty file",
    category: "Files",
    keywords: ["touch", "create", "new", "empty", "file"],
    commands: [{ cmd: "touch <file>" }],
  },
  {
    id: "rm",
    intent: "Delete files or directories",
    category: "Files",
    keywords: ["rm", "remove", "delete", "trash", "destroy", "file", "folder", "directory"],
    commands: [
      { cmd: "rm <file>", note: "Single file" },
      { cmd: "rm -r <dir>", note: "Recursive (directory)" },
      { cmd: "rm -rf <dir>", note: "Force, no confirm — careful" },
      { cmd: "rm -i <file>", note: "Interactive — confirm each" },
    ],
  },
  {
    id: "cp",
    intent: "Copy files or directories",
    category: "Files",
    keywords: ["cp", "copy", "duplicate", "clone", "file"],
    commands: [
      { cmd: "cp <src> <dst>" },
      { cmd: "cp -r <src> <dst>", note: "Recursive (directories)" },
      { cmd: "cp -p <src> <dst>", note: "Preserve mode/owner/timestamps" },
    ],
  },
  {
    id: "mv",
    intent: "Move or rename files",
    category: "Files",
    keywords: ["mv", "move", "rename", "file"],
    commands: [
      { cmd: "mv <src> <dst>" },
      { cmd: "mv -i <src> <dst>", note: "Prompt before overwrite" },
    ],
  },
  {
    id: "ln",
    intent: "Create a symlink",
    category: "Files",
    keywords: ["ln", "symlink", "link", "shortcut", "alias"],
    commands: [
      { cmd: "ln -s <target> <link>" },
      { cmd: "ln -sf <target> <link>", note: "Replace existing link" },
    ],
  },
  {
    id: "cat",
    intent: "Print a file to the terminal",
    category: "Files",
    keywords: ["cat", "print", "show", "view", "read", "file", "contents"],
    commands: [
      { cmd: "cat <file>" },
      { cmd: "cat -n <file>", note: "With line numbers" },
    ],
  },
  {
    id: "less",
    intent: "Page through a file",
    category: "Files",
    keywords: ["less", "more", "page", "scroll", "view", "read", "file"],
    commands: [
      { cmd: "less <file>", note: "q to quit, / to search" },
      { cmd: "less +F <file>", note: "Tail-follow mode" },
    ],
  },
  {
    id: "head-tail",
    intent: "Show first/last lines of a file",
    category: "Files",
    keywords: ["head", "tail", "first", "last", "top", "bottom", "lines", "preview"],
    commands: [
      { cmd: "head -n 20 <file>", note: "First 20 lines" },
      { cmd: "tail -n 20 <file>", note: "Last 20 lines" },
      { cmd: "tail -f <file>", note: "Follow new lines (logs)" },
    ],
  },
  {
    id: "wc",
    intent: "Count lines / words / chars in a file",
    category: "Files",
    keywords: ["wc", "count", "lines", "words", "chars", "size"],
    commands: [
      { cmd: "wc -l <file>", note: "Line count" },
      { cmd: "wc -w <file>", note: "Word count" },
      { cmd: "wc <file>", note: "Lines, words, bytes" },
    ],
  },
  {
    id: "find",
    intent: "Find files by name or pattern",
    category: "Search",
    keywords: ["find", "locate", "search", "files", "by", "name", "pattern", "where"],
    commands: [
      { cmd: "find . -name '*.ts'", note: "By glob pattern" },
      { cmd: "find . -iname 'readme*'", note: "Case-insensitive" },
      { cmd: "find . -type d -name node_modules", note: "Directories only" },
      { cmd: "find . -mtime -1", note: "Modified within last 24h" },
      { cmd: "find . -size +10M", note: "Larger than 10 MB" },
    ],
  },
  {
    id: "grep",
    intent: "Search for text inside files",
    category: "Search",
    keywords: ["grep", "search", "find", "text", "string", "inside", "pattern", "match"],
    commands: [
      { cmd: "grep -r 'pattern' .", note: "Recursive" },
      { cmd: "grep -rni 'pattern' .", note: "Recursive, line nums, case-insensitive" },
      { cmd: "grep -rl 'pattern' .", note: "Just the filenames" },
      { cmd: "grep -E 'foo|bar' file", note: "Extended regex" },
      { cmd: "rg 'pattern'", note: "ripgrep — faster, gitignore-aware" },
    ],
  },
  {
    id: "sed",
    intent: "Find and replace text in a file",
    category: "Search",
    keywords: ["sed", "replace", "substitute", "swap", "edit", "in", "place", "stream"],
    commands: [
      { cmd: "sed 's/old/new/g' file", note: "Print with replacements" },
      { cmd: "sed -i '' 's/old/new/g' file", note: "Edit in place (macOS)" },
      { cmd: "sed -i 's/old/new/g' file", note: "Edit in place (Linux)" },
    ],
  },
  {
    id: "awk",
    intent: "Extract or process columns of text",
    category: "Search",
    keywords: ["awk", "column", "field", "extract", "process", "split"],
    commands: [
      { cmd: "awk '{print $1}' file", note: "First whitespace column" },
      { cmd: "awk -F, '{print $2}' file.csv", note: "CSV — second column" },
    ],
  },

  // ── Permissions / ownership ──────────────────────────────────────────
  {
    id: "chmod",
    intent: "Change file permissions",
    category: "Permissions",
    keywords: ["chmod", "permission", "permissions", "executable", "rwx", "mode"],
    commands: [
      { cmd: "chmod +x <file>", note: "Make executable" },
      { cmd: "chmod 755 <file>", note: "rwx for owner, rx for group + others" },
      { cmd: "chmod -R 644 <dir>", note: "Recursively set" },
    ],
  },
  {
    id: "chown",
    intent: "Change file owner",
    category: "Permissions",
    keywords: ["chown", "owner", "ownership", "user", "group"],
    commands: [
      { cmd: "sudo chown user:group <file>" },
      { cmd: "sudo chown -R user:group <dir>", note: "Recursive" },
    ],
  },

  // ── Processes ────────────────────────────────────────────────────────
  {
    id: "ps",
    intent: "List running processes",
    category: "Process",
    keywords: ["ps", "processes", "running", "list", "tasks"],
    commands: [
      { cmd: "ps aux", note: "All processes, full info" },
      { cmd: "ps -ef", note: "Full format listing" },
      { cmd: "top", note: "Live process viewer" },
      { cmd: "htop", note: "Nicer top, if installed" },
    ],
  },
  {
    id: "kill",
    intent: "Kill a process",
    category: "Process",
    keywords: ["kill", "stop", "terminate", "end", "process", "pid"],
    commands: [
      { cmd: "kill <pid>", note: "Polite SIGTERM" },
      { cmd: "kill -9 <pid>", note: "Force SIGKILL" },
      { cmd: "pkill -f 'pattern'", note: "Kill by command-line match" },
      { cmd: "killall <name>", note: "Kill all by exact name" },
    ],
  },
  {
    id: "lsof-port",
    intent: "Find what's using a port",
    category: "Network",
    keywords: ["port", "listening", "occupied", "what", "using", "lsof", "address", "in", "use"],
    commands: [
      { cmd: "lsof -i :3000", note: "Process on port 3000" },
      { cmd: "lsof -nP -iTCP -sTCP:LISTEN", note: "All listening TCP" },
      { cmd: "kill -9 $(lsof -ti :3000)", note: "Kill whoever is on 3000" },
    ],
  },

  // ── Network ──────────────────────────────────────────────────────────
  {
    id: "curl",
    intent: "Make an HTTP request",
    category: "Network",
    keywords: ["curl", "http", "request", "get", "post", "fetch", "api", "download"],
    commands: [
      { cmd: "curl -i https://example.com", note: "GET with headers" },
      { cmd: "curl -X POST -d 'a=1' https://example.com", note: "POST form data" },
      { cmd: "curl -H 'Content-Type: application/json' -d '{\"a\":1}' https://example.com" },
      { cmd: "curl -O https://example.com/file.zip", note: "Save to disk" },
    ],
  },
  {
    id: "wget",
    intent: "Download a file",
    category: "Network",
    keywords: ["wget", "download", "fetch", "save", "file", "url"],
    commands: [
      { cmd: "wget <url>" },
      { cmd: "wget -c <url>", note: "Resume partial download" },
      { cmd: "wget -r <url>", note: "Recursive (mirror)" },
    ],
  },
  {
    id: "ping",
    intent: "Ping a host",
    category: "Network",
    keywords: ["ping", "reachable", "alive", "host", "icmp"],
    commands: [
      { cmd: "ping example.com" },
      { cmd: "ping -c 4 example.com", note: "4 packets then stop" },
    ],
  },
  {
    id: "ssh",
    intent: "Connect to a remote server via SSH",
    category: "Network",
    keywords: ["ssh", "remote", "connect", "server", "shell", "login"],
    commands: [
      { cmd: "ssh user@host" },
      { cmd: "ssh -p 2222 user@host", note: "Custom port" },
      { cmd: "ssh -i key.pem user@host", note: "With identity file" },
    ],
  },
  {
    id: "scp",
    intent: "Copy files over SSH",
    category: "Network",
    keywords: ["scp", "copy", "transfer", "remote", "ssh", "file"],
    commands: [
      { cmd: "scp file user@host:/path/" },
      { cmd: "scp user@host:/path/file .", note: "Pull from remote" },
      { cmd: "scp -r dir user@host:/path/", note: "Recursive" },
    ],
  },

  // ── Disk / archive ───────────────────────────────────────────────────
  {
    id: "df-du",
    intent: "Check disk space",
    category: "Disk",
    keywords: ["df", "du", "disk", "space", "size", "free", "used", "usage"],
    commands: [
      { cmd: "df -h", note: "Free space per mount" },
      { cmd: "du -sh *", note: "Size of each item in current dir" },
      { cmd: "du -sh ~/Downloads", note: "Size of one folder" },
    ],
  },
  {
    id: "tar",
    intent: "Create or extract a tar archive",
    category: "Archive",
    keywords: ["tar", "archive", "compress", "extract", "tarball", "gzip", "tgz"],
    commands: [
      { cmd: "tar -czf out.tar.gz <dir>", note: "Create gzip tar" },
      { cmd: "tar -xzf in.tar.gz", note: "Extract gzip tar" },
      { cmd: "tar -tzf in.tar.gz", note: "List contents" },
    ],
  },
  {
    id: "zip",
    intent: "Zip and unzip files",
    category: "Archive",
    keywords: ["zip", "unzip", "archive", "compress", "extract"],
    commands: [
      { cmd: "zip -r out.zip <dir>" },
      { cmd: "unzip in.zip" },
      { cmd: "unzip -l in.zip", note: "List contents" },
    ],
  },

  // ── Git ──────────────────────────────────────────────────────────────
  {
    id: "git-init",
    intent: "Initialize a git repository",
    category: "Git",
    keywords: ["git", "init", "initialize", "new", "repo", "repository", "start"],
    commands: [
      { cmd: "git init" },
      { cmd: "git init -b main", note: "Initial branch named main" },
    ],
  },
  {
    id: "git-clone",
    intent: "Clone a git repository",
    category: "Git",
    keywords: ["git", "clone", "download", "repo", "repository", "fetch"],
    commands: [
      { cmd: "git clone <url>" },
      { cmd: "git clone --depth 1 <url>", note: "Shallow — latest commit only" },
      { cmd: "git clone <url> <dir>", note: "Into a custom directory" },
    ],
  },
  {
    id: "git-status",
    intent: "Show working tree status",
    category: "Git",
    keywords: ["git", "status", "changes", "what", "changed", "modified"],
    commands: [
      { cmd: "git status" },
      { cmd: "git status -sb", note: "Short + branch info" },
    ],
  },
  {
    id: "git-add",
    intent: "Stage changes for commit",
    category: "Git",
    keywords: ["git", "add", "stage", "staging", "index"],
    commands: [
      { cmd: "git add <file>" },
      { cmd: "git add .", note: "All changes in current dir" },
      { cmd: "git add -A", note: "All changes in repo (incl. deletions)" },
      { cmd: "git add -p", note: "Interactively pick hunks" },
    ],
  },
  {
    id: "git-commit",
    intent: "Commit staged changes",
    category: "Git",
    keywords: ["git", "commit", "message", "save", "snapshot"],
    commands: [
      { cmd: "git commit -m 'message'" },
      { cmd: "git commit -am 'message'", note: "Stage tracked files + commit" },
      { cmd: "git commit --amend", note: "Edit the last commit" },
      { cmd: "git commit --amend --no-edit", note: "Add staged changes to last commit" },
    ],
  },
  {
    id: "git-push",
    intent: "Push commits to remote",
    category: "Git",
    keywords: ["git", "push", "upload", "remote", "publish"],
    commands: [
      { cmd: "git push" },
      { cmd: "git push -u origin <branch>", note: "First push — set upstream" },
      { cmd: "git push --force-with-lease", note: "Safer force push" },
    ],
  },
  {
    id: "git-pull",
    intent: "Pull from remote",
    category: "Git",
    keywords: ["git", "pull", "fetch", "update", "remote", "sync"],
    commands: [
      { cmd: "git pull" },
      { cmd: "git pull --rebase", note: "Rebase local commits on top" },
      { cmd: "git fetch --all --prune", note: "Just fetch — don't merge" },
    ],
  },
  {
    id: "git-branch",
    intent: "List, create, or delete branches",
    category: "Git",
    keywords: ["git", "branch", "branches", "list", "create", "delete"],
    commands: [
      { cmd: "git branch", note: "List local branches" },
      { cmd: "git branch -a", note: "Include remote branches" },
      { cmd: "git branch <name>", note: "Create branch" },
      { cmd: "git branch -d <name>", note: "Delete merged branch" },
      { cmd: "git branch -D <name>", note: "Force-delete branch" },
      { cmd: "git branch -m <new>", note: "Rename current branch" },
    ],
  },
  {
    id: "git-checkout",
    intent: "Switch branches or restore files",
    category: "Git",
    keywords: ["git", "checkout", "switch", "branch", "restore", "discard"],
    commands: [
      { cmd: "git switch <branch>", note: "Modern: switch branch" },
      { cmd: "git switch -c <branch>", note: "Create + switch" },
      { cmd: "git checkout <branch>", note: "Classic: switch branch" },
      { cmd: "git restore <file>", note: "Discard unstaged changes to file" },
      { cmd: "git restore --staged <file>", note: "Unstage a file" },
    ],
  },
  {
    id: "git-merge",
    intent: "Merge another branch in",
    category: "Git",
    keywords: ["git", "merge", "combine", "integrate", "branch"],
    commands: [
      { cmd: "git merge <branch>" },
      { cmd: "git merge --no-ff <branch>", note: "Force merge commit" },
      { cmd: "git merge --abort", note: "Bail out of in-progress merge" },
    ],
  },
  {
    id: "git-rebase",
    intent: "Rebase the current branch",
    category: "Git",
    keywords: ["git", "rebase", "replay", "linear", "history"],
    commands: [
      { cmd: "git rebase <base>" },
      { cmd: "git rebase -i HEAD~5", note: "Interactive — last 5 commits" },
      { cmd: "git rebase --continue" },
      { cmd: "git rebase --abort" },
    ],
  },
  {
    id: "git-reset",
    intent: "Reset to a previous commit",
    category: "Git",
    keywords: [
      "git",
      "reset",
      "undo",
      "rollback",
      "uncommit",
      "revert",
      "back",
      "previous",
      "commit",
    ],
    commands: [
      { cmd: "git reset --soft HEAD~1", note: "Undo last commit, keep changes staged" },
      { cmd: "git reset --mixed HEAD~1", note: "Undo last commit, keep changes unstaged" },
      { cmd: "git reset --hard HEAD~1", note: "Discard last commit AND its changes" },
      { cmd: "git reset --hard <sha>", note: "Reset to a specific commit" },
      { cmd: "git reset HEAD <file>", note: "Unstage a file" },
    ],
  },
  {
    id: "git-revert",
    intent: "Revert a commit (create an undo commit)",
    category: "Git",
    keywords: ["git", "revert", "undo", "inverse", "rollback", "safe", "commit"],
    commands: [
      { cmd: "git revert <sha>" },
      { cmd: "git revert HEAD", note: "Revert the most recent commit" },
      { cmd: "git revert -n <sha>", note: "Stage the revert without committing" },
    ],
  },
  {
    id: "git-stash",
    intent: "Stash work in progress",
    category: "Git",
    keywords: ["git", "stash", "shelve", "save", "wip", "set", "aside"],
    commands: [
      { cmd: "git stash", note: "Stash tracked changes" },
      { cmd: "git stash -u", note: "Include untracked files" },
      { cmd: "git stash list" },
      { cmd: "git stash pop", note: "Apply + drop newest" },
      { cmd: "git stash apply stash@{1}", note: "Apply a specific stash" },
      { cmd: "git stash drop stash@{0}", note: "Delete a stash" },
    ],
  },
  {
    id: "git-log",
    intent: "View commit history",
    category: "Git",
    keywords: ["git", "log", "history", "commits", "show"],
    commands: [
      { cmd: "git log --oneline -20", note: "Last 20 as one-liners" },
      { cmd: "git log --graph --oneline --all", note: "Pretty graph" },
      { cmd: "git log -p <file>", note: "History of one file with diffs" },
      { cmd: "git log --since='2 weeks ago'" },
    ],
  },
  {
    id: "git-diff",
    intent: "Show diffs",
    category: "Git",
    keywords: ["git", "diff", "changes", "what", "changed", "compare"],
    commands: [
      { cmd: "git diff", note: "Unstaged changes" },
      { cmd: "git diff --staged", note: "Staged but not committed" },
      { cmd: "git diff main..feature", note: "Between branches" },
      { cmd: "git diff <sha1> <sha2>" },
    ],
  },
  {
    id: "git-tag",
    intent: "Create / list / push tags",
    category: "Git",
    keywords: ["git", "tag", "release", "version"],
    commands: [
      { cmd: "git tag", note: "List tags" },
      { cmd: "git tag v1.0.0" },
      { cmd: "git tag -a v1.0.0 -m 'release'", note: "Annotated tag" },
      { cmd: "git push --tags", note: "Push all tags" },
      { cmd: "git tag -d v1.0.0", note: "Delete local tag" },
    ],
  },
  {
    id: "git-remote",
    intent: "Manage remotes",
    category: "Git",
    keywords: ["git", "remote", "origin", "upstream", "url"],
    commands: [
      { cmd: "git remote -v", note: "List remotes" },
      { cmd: "git remote add origin <url>" },
      { cmd: "git remote set-url origin <url>" },
      { cmd: "git remote remove origin" },
    ],
  },
  {
    id: "git-cherry-pick",
    intent: "Cherry-pick a commit",
    category: "Git",
    keywords: ["git", "cherry-pick", "cherry", "pick", "apply", "single", "commit"],
    commands: [
      { cmd: "git cherry-pick <sha>" },
      { cmd: "git cherry-pick <sha1>..<sha2>", note: "Range" },
      { cmd: "git cherry-pick --abort" },
    ],
  },
  {
    id: "git-reflog",
    intent: "Recover lost commits via reflog",
    category: "Git",
    keywords: ["git", "reflog", "recover", "lost", "deleted", "commit", "undo"],
    commands: [
      { cmd: "git reflog", note: "All HEAD movements" },
      { cmd: "git reset --hard HEAD@{1}", note: "Go back one HEAD position" },
    ],
  },
  {
    id: "git-blame",
    intent: "See who changed each line",
    category: "Git",
    keywords: ["git", "blame", "who", "wrote", "author", "line", "annotate"],
    commands: [
      { cmd: "git blame <file>" },
      { cmd: "git blame -L 10,30 <file>", note: "Specific line range" },
    ],
  },
  {
    id: "git-clean",
    intent: "Remove untracked files",
    category: "Git",
    keywords: ["git", "clean", "untracked", "remove", "delete", "build", "artifacts"],
    commands: [
      { cmd: "git clean -nd", note: "Dry run (preview)" },
      { cmd: "git clean -fd", note: "Force delete untracked files + dirs" },
      { cmd: "git clean -fdx", note: "Also nuke gitignored files" },
    ],
  },
  {
    id: "git-config",
    intent: "Configure git user",
    category: "Git",
    keywords: ["git", "config", "user", "email", "name", "setup"],
    commands: [
      { cmd: "git config --global user.name 'Your Name'" },
      { cmd: "git config --global user.email 'you@example.com'" },
      { cmd: "git config --list", note: "Show effective config" },
    ],
  },

  // ── Package management ───────────────────────────────────────────────
  {
    id: "npm",
    intent: "Run npm common commands",
    category: "Package",
    keywords: ["npm", "node", "install", "run", "script", "package"],
    commands: [
      { cmd: "npm install" },
      { cmd: "npm install <pkg>" },
      { cmd: "npm install -D <pkg>", note: "Dev dependency" },
      { cmd: "npm run <script>" },
      { cmd: "npm uninstall <pkg>" },
      { cmd: "npm outdated", note: "List outdated packages" },
    ],
  },
  {
    id: "brew",
    intent: "Homebrew install / update / list",
    category: "Package",
    keywords: ["brew", "homebrew", "mac", "install", "update", "package"],
    commands: [
      { cmd: "brew install <pkg>" },
      { cmd: "brew uninstall <pkg>" },
      { cmd: "brew update && brew upgrade", note: "Upgrade everything" },
      { cmd: "brew list", note: "Installed formulae" },
      { cmd: "brew search <name>" },
    ],
  },
];
