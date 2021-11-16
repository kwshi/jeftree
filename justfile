# temporarily silencing warnings because the 'experimental loader is
# experimental!' warning is annoying
test:
  @pnpx tap \
    --node-arg='--no-warnings' \
    --node-arg='--experimental-specifier-resolution=node' \
    --node-arg='--loader=ts-node/esm'
