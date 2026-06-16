#!/bin/bash

echo "🗑️  Uninstalling pipx and related packages..."

# Remove pipx and its dependencies
sudo apt remove --purge -y pipx \
    python3-argcomplete \
    python3-packaging \
    python3-pip-whl \
    python3-platformdirs \
    python3-userpath \
    python3-venv \
    python3.12-venv

# Clean up pipx directories
echo "🧹 Cleaning up pipx directories..."
rm -rf ~/.local/pipx
rm -rf ~/.cache/pipx
rm -rf ~/.local/share/pipx

# Remove pipx binary
rm -f ~/.local/bin/pipx

# Remove pipx from shell configs
echo "📝 Removing pipx from shell configurations..."
sed -i '/pipx/d' ~/.bashrc 2>/dev/null
sed -i '/pipx/d' ~/.bash_profile 2>/dev/null
sed -i '/pipx/d' ~/.zshrc 2>/dev/null
sed -i '/pipx/d' ~/.profile 2>/dev/null

# Remove any pipx completions
rm -f ~/.bash_completion.d/pipx 2>/dev/null
rm -f ~/.local/share/bash-completion/completions/pipx 2>/dev/null

# Auto-remove orphaned packages
echo "🧹 Cleaning up orphaned packages..."
sudo apt autoremove -y

echo ""
echo "✅ pipx has been completely uninstalled!"
echo ""
echo "To verify:"
echo "  which pipx  # Should return nothing"
echo "  pipx --version  # Should say 'command not found'"
