<?php
/**
 * Chicken Care Landing Theme Functions
 * 
 * Theme functionality for chickencare.app landing page
 */

if ( ! function_exists( 'chicken_care_theme_setup' ) ) {
    /**
     * Theme setup function
     */
    function chicken_care_theme_setup() {
        // Add theme support for various features
        add_theme_support( 'wp-block-styles' );
        add_theme_support( 'align-wide' );
        add_theme_support( 'editor-styles' );
        add_theme_support( 'responsive-embeds' );
        add_theme_support( 'custom-logo' );
        add_theme_support( 'post-thumbnails' );
        
        // Add support for editor color palette from theme.json
        add_theme_support( 'editor-color-palette' );
        add_theme_support( 'disable-custom-colors' );
        
        // Add support for editor gradient presets from theme.json
        add_theme_support( 'editor-gradient-presets' );
        add_theme_support( 'disable-custom-gradients' );
        
        // Add support for editor font sizes from theme.json
        add_theme_support( 'editor-font-sizes' );
        add_theme_support( 'disable-custom-font-sizes' );
        
        // Add editor styles
        add_editor_style( 'style.css' );
        
        // Register navigation menus
        register_nav_menus( array(
            'primary' => __( 'Primary Menu', 'chicken-care-theme' ),
            'footer'  => __( 'Footer Menu', 'chicken-care-theme' ),
        ) );
    }
}
add_action( 'after_setup_theme', 'chicken_care_theme_setup' );

/**
 * Enqueue theme styles and scripts
 */
function chicken_care_theme_scripts() {
    // Enqueue main stylesheet
    wp_enqueue_style( 
        'chicken-care-style',
        get_stylesheet_uri(),
        array(),
        wp_get_theme()->get( 'Version' )
    );
    
    // Enqueue Fraunces font from Google Fonts
    wp_enqueue_style(
        'fraunces-font',
        'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&display=swap',
        array(),
        null
    );
    
    // Enqueue theme JavaScript (minimal)
    wp_enqueue_script(
        'chicken-care-theme-js',
        get_template_directory_uri() . '/assets/js/theme.js',
        array(),
        wp_get_theme()->get( 'Version' ),
        true
    );
    
    // Add inline CSS for dynamic customizations
    $custom_css = "
        :root {
            --wp-admin-theme-color: #4F39F6;
        }
        
        /* Ensure glass card effects work in editor */
        .editor-styles-wrapper .glass-card {
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
        }
    ";
    wp_add_inline_style( 'chicken-care-style', $custom_css );
}
add_action( 'wp_enqueue_scripts', 'chicken_care_theme_scripts' );

/**
 * Enqueue editor styles
 */
function chicken_care_editor_styles() {
    wp_enqueue_style(
        'chicken-care-editor-styles',
        get_template_directory_uri() . '/style.css',
        array(),
        wp_get_theme()->get( 'Version' )
    );
    
    // Enqueue Fraunces font in editor
    wp_enqueue_style(
        'fraunces-font-editor',
        'https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,700;1,9..144,400&display=swap',
        array(),
        null
    );
}
add_action( 'enqueue_block_editor_assets', 'chicken_care_editor_styles' );

/**
 * Register block patterns
 */
function chicken_care_register_block_patterns() {
    // Check if block patterns are supported
    if ( function_exists( 'register_block_pattern_category' ) ) {
        // Register pattern categories
        register_block_pattern_category(
            'chicken-care-hero',
            array( 'label' => __( 'Hero Sections', 'chicken-care-theme' ) )
        );
        
        register_block_pattern_category(
            'chicken-care-features',
            array( 'label' => __( 'Features', 'chicken-care-theme' ) )
        );
        
        register_block_pattern_category(
            'chicken-care-stats',
            array( 'label' => __( 'Statistics', 'chicken-care-theme' ) )
        );
        
        register_block_pattern_category(
            'chicken-care-content',
            array( 'label' => __( 'Content Sections', 'chicken-care-theme' ) )
        );
    }
}
add_action( 'init', 'chicken_care_register_block_patterns' );

/**
 * Add custom CSS classes to body
 */
function chicken_care_body_classes( $classes ) {
    // Add class for the theme
    $classes[] = 'chicken-care-theme';
    
    // Add class for landing pages
    if ( is_page_template( 'landing-page' ) || is_front_page() ) {
        $classes[] = 'landing-page';
    }
    
    return $classes;
}
add_filter( 'body_class', 'chicken_care_body_classes' );

/**
 * Customize excerpt length
 */
function chicken_care_excerpt_length( $length ) {
    return 30; // 30 words
}
add_filter( 'excerpt_length', 'chicken_care_excerpt_length' );

/**
 * Customize excerpt more text
 */
function chicken_care_excerpt_more( $more ) {
    return '...';
}
add_filter( 'excerpt_more', 'chicken_care_excerpt_more' );

/**
 * Add custom image sizes
 */
function chicken_care_custom_image_sizes() {
    // Feature card images
    add_image_size( 'feature-card', 400, 300, true );
    
    // Hero background images
    add_image_size( 'hero-background', 1920, 1080, true );
    
    // Blog thumbnails
    add_image_size( 'blog-thumbnail', 600, 400, true );
    
    // App screenshot displays
    add_image_size( 'app-screenshot', 800, 600, true );
}
add_action( 'after_setup_theme', 'chicken_care_custom_image_sizes' );

/**
 * Disable WordPress admin bar for non-admin users on frontend
 */
function chicken_care_disable_admin_bar() {
    if ( ! current_user_can( 'administrator' ) && ! is_admin() ) {
        show_admin_bar( false );
    }
}
add_action( 'after_setup_theme', 'chicken_care_disable_admin_bar' );

/**
 * Add preconnect for Google Fonts
 */
function chicken_care_resource_hints( $urls, $relation_type ) {
    if ( wp_style_is( 'fraunces-font', 'queue' ) && 'preconnect' === $relation_type ) {
        $urls[] = array(
            'href' => 'https://fonts.gstatic.com',
            'crossorigin',
        );
    }
    return $urls;
}
add_filter( 'wp_resource_hints', 'chicken_care_resource_hints', 10, 2 );

/**
 * Optimize WordPress for performance
 */
function chicken_care_performance_optimizations() {
    // Remove WordPress version number for security
    remove_action( 'wp_head', 'wp_generator' );
    
    // Remove unnecessary WordPress head tags
    remove_action( 'wp_head', 'wlwmanifest_link' );
    remove_action( 'wp_head', 'rsd_link' );
    remove_action( 'wp_head', 'wp_shortlink_wp_head' );
    
    // Remove emoji scripts and styles
    remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
    remove_action( 'wp_print_styles', 'print_emoji_styles' );
    remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
    remove_action( 'admin_print_styles', 'print_emoji_styles' );
    
    // Disable pingbacks
    add_filter( 'xmlrpc_enabled', '__return_false' );
}
add_action( 'init', 'chicken_care_performance_optimizations' );

/**
 * Add SEO meta tags for chickencare.app
 */
function chicken_care_seo_meta_tags() {
    if ( is_front_page() ) {
        echo '<meta name="description" content="Transform your chicken care with smart farm management. Track production, manage flocks, optimize costs, and maximize profitability with ChickenCare.app">' . "\n";
        echo '<meta name="keywords" content="chicken farm management, egg production tracking, poultry software, farm management app, chicken flock management">' . "\n";
        echo '<meta property="og:title" content="ChickenCare.app - Smart Chicken Farm Management">' . "\n";
        echo '<meta property="og:description" content="Professional chicken farm management software for tracking production, managing flocks, and optimizing profitability.">' . "\n";
        echo '<meta property="og:type" content="website">' . "\n";
        echo '<meta property="og:url" content="https://chickencare.app/">' . "\n";
        echo '<meta name="twitter:card" content="summary_large_image">' . "\n";
        echo '<meta name="twitter:title" content="ChickenCare.app - Smart Chicken Farm Management">' . "\n";
        echo '<meta name="twitter:description" content="Professional chicken farm management software for modern farmers.">' . "\n";
    }
}
add_action( 'wp_head', 'chicken_care_seo_meta_tags' );

/**
 * Add structured data for the application
 */
function chicken_care_structured_data() {
    if ( is_front_page() ) {
        $schema = array(
            '@context' => 'https://schema.org',
            '@type' => 'SoftwareApplication',
            'name' => 'ChickenCare.app',
            'description' => 'Professional chicken farm management software for tracking production, managing flocks, and optimizing profitability.',
            'url' => 'https://chickencare.app',
            'applicationCategory' => 'BusinessApplication',
            'operatingSystem' => 'Web Browser',
            'offers' => array(
                '@type' => 'Offer',
                'price' => '0',
                'priceCurrency' => 'USD',
                'availability' => 'https://schema.org/InStock',
                'name' => 'Free Trial'
            ),
            'publisher' => array(
                '@type' => 'Organization',
                'name' => 'ChickenCare',
                'url' => 'https://chickencare.app'
            )
        );
        
        echo '<script type="application/ld+json">' . wp_json_encode( $schema, JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT ) . '</script>' . "\n";
    }
}
add_action( 'wp_head', 'chicken_care_structured_data' );

/**
 * Security enhancements
 */
function chicken_care_security_headers() {
    // Add security headers
    header( 'X-Content-Type-Options: nosniff' );
    header( 'X-Frame-Options: SAMEORIGIN' );
    header( 'X-XSS-Protection: 1; mode=block' );
    header( 'Referrer-Policy: strict-origin-when-cross-origin' );
}
add_action( 'send_headers', 'chicken_care_security_headers' );

/**
 * Customize WordPress login page to match theme branding
 */
function chicken_care_login_styles() {
    ?>
    <style type="text/css">
        .login h1 a {
            background-image: none;
            background-color: #4F39F6;
            color: white;
            width: auto;
            height: auto;
            text-decoration: none;
            padding: 20px;
            border-radius: 12px;
            font-family: 'Fraunces', serif;
            font-weight: 600;
        }
        
        .login form {
            border-radius: 12px;
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(12px);
        }
        
        .login #nav a, .login #backtoblog a {
            color: #4F39F6;
        }
        
        .login #nav a:hover, .login #backtoblog a:hover {
            color: #2A2580;
        }
        
        .login .button-primary {
            background: linear-gradient(135deg, #4F39F6 0%, #8833D7 100%);
            border: none;
            border-radius: 8px;
            font-family: 'Fraunces', serif;
            font-weight: 600;
        }
        
        body.login {
            background: linear-gradient(135deg, #F9FAFB 0%, #E5E7EB 100%);
        }
    </style>
    <?php
}
add_action( 'login_head', 'chicken_care_login_styles' );

/**
 * Change login logo URL
 */
function chicken_care_login_logo_url() {
    return 'https://chickencare.app';
}
add_filter( 'login_headerurl', 'chicken_care_login_logo_url' );

/**
 * Change login logo title
 */
function chicken_care_login_logo_title() {
    return 'ChickenCare.app - Smart Chicken Farm Management';
}
add_filter( 'login_headertext', 'chicken_care_login_logo_title' );

/**
 * Add theme customizer options
 */
function chicken_care_customize_register( $wp_customize ) {
    // Add hero section customizer panel
    $wp_customize->add_section( 'chicken_care_hero', array(
        'title'    => __( 'Hero Section', 'chicken-care-theme' ),
        'priority' => 120,
    ) );
    
    // Hero title
    $wp_customize->add_setting( 'chicken_care_hero_title', array(
        'default'           => 'Transform Your Chicken Care with Smart Management',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    
    $wp_customize->add_control( 'chicken_care_hero_title', array(
        'label'   => __( 'Hero Title', 'chicken-care-theme' ),
        'section' => 'chicken_care_hero',
        'type'    => 'text',
    ) );
    
    // Hero subtitle
    $wp_customize->add_setting( 'chicken_care_hero_subtitle', array(
        'default'           => 'Track production, manage flocks, optimize feed costs, and maximize profitability with our comprehensive farm management platform.',
        'sanitize_callback' => 'sanitize_textarea_field',
    ) );
    
    $wp_customize->add_control( 'chicken_care_hero_subtitle', array(
        'label'   => __( 'Hero Subtitle', 'chicken-care-theme' ),
        'section' => 'chicken_care_hero',
        'type'    => 'textarea',
    ) );
    
    // Call-to-action button text
    $wp_customize->add_setting( 'chicken_care_cta_text', array(
        'default'           => 'Start Free Trial',
        'sanitize_callback' => 'sanitize_text_field',
    ) );
    
    $wp_customize->add_control( 'chicken_care_cta_text', array(
        'label'   => __( 'CTA Button Text', 'chicken-care-theme' ),
        'section' => 'chicken_care_hero',
        'type'    => 'text',
    ) );
    
    // Call-to-action button URL
    $wp_customize->add_setting( 'chicken_care_cta_url', array(
        'default'           => 'https://chicken-care-app.com',
        'sanitize_callback' => 'esc_url_raw',
    ) );
    
    $wp_customize->add_control( 'chicken_care_cta_url', array(
        'label'   => __( 'CTA Button URL', 'chicken-care-theme' ),
        'section' => 'chicken_care_hero',
        'type'    => 'url',
    ) );
}
add_action( 'customize_register', 'chicken_care_customize_register' );

/**
 * Add analytics tracking code
 */
function chicken_care_analytics_code() {
    // Add Google Analytics 4 code here when ready
    // This will be populated with actual tracking code during deployment
    ?>
    <!-- Google Analytics 4 - ChickenCare.app -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
    <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'GA_MEASUREMENT_ID');
    </script>
    <?php
}
add_action( 'wp_head', 'chicken_care_analytics_code' );

/**
 * Theme version for cache busting
 */
function chicken_care_theme_version() {
    return wp_get_theme()->get( 'Version' );
}