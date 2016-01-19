#!/usr/bin/env python3

import setuptools
from distutils.command.build import build as _build
from setuptools.command.bdist_egg import bdist_egg as _bdist_egg
import os
from shutil import copy2, copytree, rmtree
import json

package_name = 'alkindi_r2_front'
# XXX consider reading package_name from meta['python_package']
meta = json.loads(open('../package.json', 'r').read())
if meta.get('x-timestamp'):
    ts = str(int(os.path.getmtime('../dist/main.js')))
    meta['version'] = '.'.join([meta['version'], ts])

min_build = os.environ.get('MIN_BUILD') == '1'
print("building {} {}".format(meta['version'], 'min' if min_build else ''))

target = os.path.join(package_name, 'assets')
rmtree(target, ignore_errors=True)
os.mkdir(target)

# main
print("copying project assets")
if min_build:
    copy2('../dist/main.min.js', target)
    # copy2('../dist/main.min.js.map', target)
    copy2('../dist/main.min.css', target)
    # copy2('../dist/main.min.css.map', target)
else:
    copy2('../dist/main.js', target)
    copy2('../dist/main.js.map', target)
    copy2('../dist/main.css', target)
    copy2('../dist/main.css.map', target)

# images
copytree('../images', os.path.join(target, 'images'))

# bootstrap
print("copying bootstrap assets")
bootstrap_dir = os.path.join(target, 'bootstrap')
os.mkdir(bootstrap_dir)
copytree('../node_modules/bootstrap/dist/css',
         os.path.join(bootstrap_dir, 'css'))
copytree('../node_modules/bootstrap/dist/fonts',
         os.path.join(bootstrap_dir, 'fonts'))

# fontawesome
print("copying font-awesome assets")
fontawesome_dir = os.path.join(target, 'font-awesome')
os.mkdir(fontawesome_dir)
copytree('../node_modules/font-awesome/css',
         os.path.join(fontawesome_dir, 'css'))
copytree('../node_modules/font-awesome/fonts',
         os.path.join(fontawesome_dir, 'fonts'))

data_files = []
for (path, dirs, files) in os.walk(target):
    data_files.extend([os.path.join(path, file) for file in files])
for file in data_files:
    print(file)

# XXX consider reading these operations from meta
# write version and min_build flag.
with open(os.path.join(package_name, '__init__.py'), 'w') as f:
    print("version = '{}'".format(meta['version']), file=f)
    print("min_build = {}".format(min_build), file=f)

setuptools.setup(
    name=meta['name'],
    version=meta['version'],
    description=meta['description'],
    author=', '.join(meta['authors']),
    packages=[package_name],
    package_data={package_name: data_files},
    include_package_data=True,
    zip_safe=False)
