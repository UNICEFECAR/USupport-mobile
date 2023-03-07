#!/bin/bash

# Clear the screen
clear

# Read the type of locale from the user input
echo -n "Enter locale type (block, screen, modal or backdrop): "
read locale_type

if [ -z "$locale_type" ]; then
    echo "Locale type is required"
    exit 1
fi

# Check whether the locale_type is block, backdrop or screen
if [ "$locale_type" != "block" ] && [ "$locale_type" != "screen" ] && [ "$locale_type" != "backdrop" ] && [ "$locale_type" != "modal" ]; then
    echo "Locale type must be block, screen, modal or backdrop"
    exit 1
fi

# Transform the locale type to lowercase, plural
locale_type_plural=$(echo $locale_type | tr '[:upper:]' '[:lower:]' | sed -r 's/(.*)$/\1s/')

# Read the name of the block, backdrop, modal or screen from the user input
echo -n "Enter $locale_type name (CamelCase): "
read locale_name_camel

if [ -z "$locale_name_camel" ]; then
    echo "Locale name is required"
    exit 1
fi

# Transform the first letter of the block name to uppercase
locale_name_camel=$(echo $locale_name_camel | tr '[:lower:]' '[:upper:]' | cut -c1)$(echo $locale_name_camel | cut -c2-)

# Confirm such a block, backdrop, modal or screen exists
if [ ! -d "src/$locale_type_plural/$locale_name_camel" ]; then
    echo "Block, backdrop or screen does not exist. Please choose a different block or screen name."
    exit 1
fi

# Read the locale name from the user input
echo -n "Enter locale name (en): "
read locale_name

if [ -z "$locale_name" ]; then
    echo "Locale name is required"
    exit 1
fi

# Transform the locale name to lowercase
locale_name_lower=$(echo $locale_name | tr '[:upper:]' '[:lower:]')

# Check if the locale file already exists
if [ -f "src/$locale_type_plural/$locale_name_camel/locales/$locale_name_lower.json" ]; then
    echo "Locale file already exists. Please choose a different locale name."
    exit 1
fi

# Create the locale file
touch "src/$locale_type_plural/$locale_name_camel/locales/$locale_name_lower.json"

# Copy the default locale file to the new locale file
cp "src/$locale_type_plural/$locale_name_camel/locales/en.json" "src/$locale_type_plural/$locale_name_camel/locales/$locale_name_lower.json"

# Add the new locale to the locales file in the block, backdrop or screen directory
echo "export * as $locale_name_lower from \"./locales/$locale_name_lower.json\"" >> "src/$locale_type_plural/$locale_name_camel/locales.js"