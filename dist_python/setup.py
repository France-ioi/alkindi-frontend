#!/usr/bin/env python3

import setuptools
from distutils.command.build import build as _build
from setuptools.command.bdist_egg import bdist_egg as _bdist_egg
import os
from shutil import copy2, copytree, rmtree
import json

meta = json.loads(open('../package.json', 'r').read())

# XXX consider reading package_name from meta['python_package']
package_name = 'alkindi_r2_front'


class build(_build):
    pass


class bdist_egg(_bdist_egg):
    def run(self):
        self.run_command('build_data')
        _bdist_egg.run(self)


class build_data(setuptools.Command):
    description = 'copy built assets into the resource package'
    user_options = [
        ('min', None, 'Include minified assets.')
    ]

    def initialize_options(self):
        self.min = False

    def finalize_options(self):
        if self.min == 1:
            self.min = True

    def run(self):
        target = os.path.join(package_name, 'assets')
        rmtree(target, ignore_errors=True)
        os.mkdir(target)
        # XXX consider reading these operations from meta
        # write version
        with open(os.path.join(package_name, '__init__.py'), 'w') as f:
            print("version = '{}'".format(meta['version']), file=f)
            print("min_build = {}".format(self.min), file=f)
        # main
        print("copying project assets")
        if self.min:
            copy2('../dist/main.min.js', target)
            copy2('../dist/main.min.js.map', target)
            copy2('../dist/main.min.css', target)
            copy2('../dist/main.min.css.map', target)
        else:
            copy2('../dist/main.js', target)
            copy2('../dist/main.js.map', target)
            copy2('../dist/main.css', target)
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


setuptools.setup(
    name=meta['name'],
    version=meta['version'],
    description=meta['description'],
    author=', '.join(meta['authors']),
    packages=[package_name],
    include_package_data=True,
    cmdclass={
        'bdist_egg': bdist_egg,
        'build': build,
        'build_data': build_data
    })
