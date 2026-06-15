#!/usr/bin/env python3
"""
Test script for addPSLLogoToPortraits.py
Verifies that the PSL logo is correctly added to portrait images.
"""

import os
import sys
from unittest.mock import patch, MagicMock
from pathlib import Path

# Add scripts directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

def test_logo_file_exists():
    """Test that the logo file exists in assets directory"""
    logo_path = Path(__file__).parent.parent / "assets" / "psl-bunny-logo.png"
    assert logo_path.exists(), f"Logo file not found at {logo_path}"
    print("✓ Logo file exists")

def test_script_imports():
    """Test that the main script can be imported"""
    try:
        from scripts import addPSLLogoToPortraits
        print("✓ Script imports successfully")
        return True
    except ImportError as e:
        print(f"✗ Failed to import script: {e}")
        return False

def test_add_logo_function_exists():
    """Test that add_logo_to_portrait function exists"""
    try:
        from scripts.addPSLLogoToPortraits import add_logo_to_portrait
        assert callable(add_logo_to_portrait), "add_logo_to_portrait should be callable"
        print("✓ add_logo_to_portrait function exists and is callable")
        return True
    except (ImportError, AttributeError) as e:
        print(f"✗ Failed to find add_logo_to_portrait function: {e}")
        return False

def test_add_logo_with_mock_image():
    """Test the logo addition with a mock image"""
    try:
        from scripts.addPSLLogoToPortraits import add_logo_to_portrait
        from unittest.mock import Mock
        from PIL import Image
        
        # Create a mock portrait image (100x100 RGB)
        mock_portrait = Image.new('RGB', (100, 100), color='red')
        
        # Mock the logo opening to return a simple white square
        with patch('scripts.addPSLLogoToPortraits.Image.open') as mock_open:
            mock_logo = Image.new('RGB', (20, 20), color='white')
            mock_open.return_value = mock_logo
            
            # Call the function
            result = add_logo_to_portrait(mock_portrait, 'fake_logo_path.png')
            
            # Verify result is an Image
            assert isinstance(result, Image.Image), "Result should be a PIL Image"
            assert result.size == (100, 100), "Result size should match input size"
            
        print("✓ add_logo_to_portrait works with mock images")
        return True
    except Exception as e:
        print(f"✗ Failed to test with mock image: {e}")
        return False

def test_logo_positioning():
    """Test that logo is positioned correctly (bottom-right corner)"""
    try:
        from scripts.addPSLLogoToPortraits import add_logo_to_portrait
        from PIL import Image
        
        # Create test images
        portrait = Image.new('RGB', (200, 200), color='red')
        logo = Image.new('RGB', (40, 40), color='white')
        
        with patch('scripts.addPSLLogoToPortraits.Image.open') as mock_open:
            mock_open.return_value = logo
            result = add_logo_to_portrait(portrait, 'fake_logo_path.png')
            
            # Check that bottom-right area has white pixels (logo)
            # Logo is 40x40 with 10px padding, so it should be at position (150, 150) to (190, 190)
            
            # Sample some pixels in the expected logo area
            white_count = 0
            for y in range(150, 190):
                for x in range(150, 190):
                    pixel = result.getpixel((x, y))
                    # Check if pixel is white (255, 255, 255, 255) or close to it
                    if len(pixel) >= 3 and pixel[0] == 255 and pixel[1] == 255 and pixel[2] == 255:
                        white_count += 1
            
            # We expect most of the 40x40 = 1600 pixels to be white
            assert white_count > 1000, f"Expected at least 1000 white pixels in bottom-right, got {white_count}"
            
        print("✓ Logo positioned in bottom-right corner")
        return True
    except Exception as e:
        print(f"✗ Failed logo positioning test: {e}")
        return False

def main():
    """Run all tests"""
    print("Running PSL Logo Script Tests\n")
    print("=" * 50)
    
    tests = [
        test_logo_file_exists,
        test_script_imports,
        test_add_logo_function_exists,
        test_add_logo_with_mock_image,
        test_logo_positioning,
    ]
    
    passed = 0
    failed = 0
    
    for test in tests:
        try:
            result = test()
            if result is None or result:
                passed += 1
            else:
                failed += 1
        except AssertionError as e:
            print(f"✗ {test.__name__}: {e}")
            failed += 1
        except Exception as e:
            print(f"✗ {test.__name__}: Unexpected error: {e}")
            failed += 1
        print()
    
    print("=" * 50)
    print(f"\nResults: {passed} passed, {failed} failed")
    
    return 0 if failed == 0 else 1

if __name__ == "__main__":
    sys.exit(main())
