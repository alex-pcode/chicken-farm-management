<?php
/**
 * Main template file
 * 
 * This is the fallback template for the Chicken Care block theme.
 * In a block theme, most content is handled by HTML templates,
 * but this file provides compatibility for edge cases.
 */

get_header(); ?>

<main class="wp-block-group alignfull" style="padding:var(--wp--preset--spacing--3xl) 0">
    <div class="wp-block-group__inner-container container">
        
        <?php if ( have_posts() ) : ?>
            
            <?php while ( have_posts() ) : the_post(); ?>
                
                <article id="post-<?php the_ID(); ?>" <?php post_class( 'glass-card' ); ?>>
                    
                    <?php if ( ! is_front_page() && has_post_thumbnail() ) : ?>
                        <div class="post-thumbnail" style="margin-bottom: var(--wp--preset--spacing--lg);">
                            <?php the_post_thumbnail( 'large', array( 'style' => 'border-radius: var(--radius-md);' ) ); ?>
                        </div>
                    <?php endif; ?>
                    
                    <header class="entry-header" style="margin-bottom: var(--wp--preset--spacing--lg);">
                        <?php
                        if ( is_singular() ) :
                            the_title( '<h1 class="entry-title" style="margin-bottom: var(--wp--preset--spacing--sm);">', '</h1>' );
                        else :
                            the_title( '<h2 class="entry-title"><a href="' . esc_url( get_permalink() ) . '" rel="bookmark" style="text-decoration: none; color: inherit;">', '</a></h2>' );
                        endif;
                        
                        if ( 'post' === get_post_type() ) : ?>
                            <div class="entry-meta" style="font-size: var(--wp--preset--font-size--caption); color: var(--wp--preset--color--text-secondary); text-transform: uppercase; letter-spacing: 0.05em;">
                                <time datetime="<?php echo get_the_date( 'c' ); ?>"><?php echo get_the_date(); ?></time>
                                <?php if ( has_category() ) : ?>
                                    <span style="margin: 0 0.5rem;">•</span>
                                    <?php the_category( ', ' ); ?>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </header>
                    
                    <div class="entry-content">
                        <?php
                        if ( is_singular() ) {
                            the_content();
                            
                            wp_link_pages( array(
                                'before' => '<div class="page-links" style="margin-top: var(--wp--preset--spacing--lg);">',
                                'after'  => '</div>',
                            ) );
                        } else {
                            the_excerpt();
                            ?>
                            <div style="margin-top: var(--wp--preset--spacing--md);">
                                <a href="<?php echo esc_url( get_permalink() ); ?>" class="button-secondary" style="display: inline-block;">
                                    Read More
                                </a>
                            </div>
                            <?php
                        }
                        ?>
                    </div>
                    
                    <?php if ( is_singular() && ( comments_open() || get_comments_number() ) ) : ?>
                        <footer class="entry-footer" style="margin-top: var(--wp--preset--spacing--xl); padding-top: var(--wp--preset--spacing--lg); border-top: 1px solid var(--wp--preset--color--border);">
                            <?php comments_template(); ?>
                        </footer>
                    <?php endif; ?>
                    
                </article>
                
            <?php endwhile; ?>
            
            <?php if ( ! is_singular() ) : ?>
                <nav class="posts-navigation" style="margin-top: var(--wp--preset--spacing--2xl);">
                    <div style="display: flex; justify-content: space-between; align-items: center; gap: var(--wp--preset--spacing--md);">
                        <?php
                        $prev_text = '<span style="font-size: var(--wp--preset--font-size--caption); text-transform: uppercase; color: var(--wp--preset--color--text-secondary);">Previous</span><br>%title';
                        $next_text = '<span style="font-size: var(--wp--preset--font-size--caption); text-transform: uppercase; color: var(--wp--preset--color--text-secondary);">Next</span><br>%title';
                        
                        $prev_link = get_previous_posts_link( $prev_text );
                        $next_link = get_next_posts_link( $next_text );
                        
                        if ( $prev_link ) {
                            echo '<div class="nav-previous">' . $prev_link . '</div>';
                        }
                        
                        if ( $next_link ) {
                            echo '<div class="nav-next" style="text-align: right;">' . $next_link . '</div>';
                        }
                        ?>
                    </div>
                </nav>
            <?php endif; ?>
            
        <?php else : ?>
            
            <div class="glass-card text-center">
                <h1>Nothing Found</h1>
                <p style="color: var(--wp--preset--color--text-secondary);">
                    It looks like nothing was found at this location. 
                    Maybe try searching for what you're looking for?
                </p>
                <div style="margin-top: var(--wp--preset--spacing--lg);">
                    <?php get_search_form(); ?>
                </div>
                <div style="margin-top: var(--wp--preset--spacing--lg);">
                    <a href="<?php echo esc_url( home_url( '/' ) ); ?>" class="shiny-cta">
                        Back to Homepage
                    </a>
                </div>
            </div>
            
        <?php endif; ?>
        
    </div>
</main>

<?php get_footer(); ?>