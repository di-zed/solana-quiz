# Use Ubuntu 24.04 base image with amd64 architecture
FROM --platform=linux/amd64 ubuntu:24.04

# Set non-interactive mode for apt
ENV DEBIAN_FRONTEND=noninteractive

# Install required packages for Rust, Solana, Anchor and general development
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    git \
    build-essential \
    pkg-config \
    libudev-dev \
    llvm \
    libclang-dev \
    protobuf-compiler \
    libssl-dev \
    ca-certificates \
    unzip \
    xz-utils \
    python3 \
    && apt-get clean

# Set up environment variables
ENV PATH="/root/.cargo/bin:/root/.local/share/solana/install/active_release/bin:/root/.avm/bin:${PATH}"

# Install Rust (stable)
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y

# Install Solana CLI (Agave fork)
RUN sh -c "$(curl -sSfL https://release.anza.xyz/stable/install)"

# Install Anchor Version Manager (AVM) and latest Anchor
RUN cargo install --git https://github.com/coral-xyz/anchor avm --force && \
    avm install latest && \
    avm use latest

# Add environment setup to .bashrc
RUN echo '\n# Rust' >> /root/.bashrc && \
    echo 'export PATH="$HOME/.cargo/bin:$PATH"' >> /root/.bashrc && \
    echo '\n# Solana' >> /root/.bashrc && \
    echo 'export PATH="$HOME/.local/share/solana/install/active_release/bin:$PATH"' >> /root/.bashrc && \
    echo '\n# AVM' >> /root/.bashrc && \
    echo 'export PATH="$HOME/.avm/bin:$PATH"' >> /root/.bashrc && \
    echo 'source <(avm completions bash)' >> /root/.bashrc

# Configure colorful terminal prompt
RUN echo "\n# Prompt color" >> /root/.bashrc && \
    echo "PS1='${debian_chroot:+(\$debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" >> /root/.bashrc

# Default shell
CMD ["/bin/bash"]