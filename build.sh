rm -rf ./publish
mkdir -p ./publish/public
yarn build
rm -rf ./server/tsc_out
cp -r ./client/dist/* ./publish/public
rm -rf ./client/dist