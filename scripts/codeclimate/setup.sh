cd /tmp \
&& curl -L https://github.com/codeclimate/codeclimate/archive/master.tar.gz | tar xz \
&& cd codeclimate-master \
&& /bin/bash -l -c "make install" \
&& /bin/bash -l -c "codeclimate engines:install"