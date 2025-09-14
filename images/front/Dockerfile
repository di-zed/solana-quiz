FROM node:24.4.1-slim

WORKDIR /home/app

# Configure colorful terminal prompt
RUN echo "\n# Prompt color" >> /root/.bashrc && \
    echo "PS1='${debian_chroot:+(\$debian_chroot)}\[\033[01;32m\]\u@\h\[\033[00m\]:\[\033[01;34m\]\w\[\033[00m\]\$ '" >> /root/.bashrc

CMD ["/bin/bash"]